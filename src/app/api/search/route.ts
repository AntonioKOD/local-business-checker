import { NextRequest, NextResponse } from 'next/server';
import { BusinessChecker, SearchResults } from '@/lib/business-checker';
import { getPayload } from 'payload';
import config from '@/payload.config';

// Track anonymous user searches by IP
const anonymousSearchCounts = new Map<string, { count: number; lastReset: number; lastRequest: number }>();
const SEARCH_LIMIT_RESET_HOURS = 24;
const MIN_REQUEST_INTERVAL_MS = 2000; // Minimum 2 seconds between requests

// Simple cache to prevent duplicate expensive API calls
const searchCache = new Map<string, { results: SearchResults; timestamp: number }>();
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes cache

// Cleanup old entries every hour to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const cutoff = now - (SEARCH_LIMIT_RESET_HOURS * 60 * 60 * 1000);
  
  // Cleanup anonymous search tracking
  for (const [ip, data] of anonymousSearchCounts.entries()) {
    if (data.lastReset < cutoff) {
      anonymousSearchCounts.delete(ip);
    }
  }
  
  // Cleanup search cache
  for (const [key, data] of searchCache.entries()) {
    if ((now - data.timestamp) > CACHE_DURATION_MS) {
      searchCache.delete(key);
    }
  }
}, 60 * 60 * 1000); // Run every hour

export async function POST(request: NextRequest) {
  try {
    const { query, location, radius, maxResults = 10, userId, filterNoWebsite = false } = await request.json();

    if (!query || !location) {
      return NextResponse.json(
        { error: 'Both query and location are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      return NextResponse.json(
        { error: 'Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Check user authentication and subscription status
    let isSubscribed = false;
    
    if (userId) {
      try {
        const payload = await getPayload({ config });
        const userResult = await payload.findByID({
          collection: 'users',
          id: userId,
        });
        
        if (userResult && (userResult as { subscriptionStatus?: string }).subscriptionStatus === 'active') {
          isSubscribed = true;
        }
      } catch (error) {
        console.error('Error checking user subscription:', error);
      }
    }

    // Handle anonymous user search limits
    const userIP = (request as { ip?: string }).ip || request.headers.get('x-forwarded-for') || 'unknown';
    let canSearchAnonymously = true;
    
    if (!isSubscribed) {
      const now = Date.now();
      const ipData = anonymousSearchCounts.get(userIP);
      
      if (ipData) {
        // Check if request is too frequent
        const timeSinceLastRequest = now - ipData.lastRequest;
        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
          return NextResponse.json({
            error: 'Rate limit exceeded',
            message: 'Please wait a moment before making another search.',
            retryAfter: Math.ceil((MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest) / 1000)
          }, { status: 429 });
        }
        
        // Reset count if 24 hours have passed
        const hoursElapsed = (now - ipData.lastReset) / (1000 * 60 * 60);
        if (hoursElapsed >= SEARCH_LIMIT_RESET_HOURS) {
          anonymousSearchCounts.set(userIP, { count: 0, lastReset: now, lastRequest: now });
        } else if (ipData.count >= 2) {
          canSearchAnonymously = false;
        }
      } else {
        anonymousSearchCounts.set(userIP, { count: 0, lastReset: now, lastRequest: now });
      }
    }

    if (!isSubscribed && !canSearchAnonymously) {
      return NextResponse.json({
        error: 'Search limit exceeded',
        message: 'You have reached the limit of 2 free searches. Subscribe to get unlimited searches.',
        requiresSubscription: true,
        upgradePrice: 7.00
      }, { status: 403 });
    }

    // Check cache first to avoid expensive API calls
    const cacheKey = `${query.toLowerCase()}-${location.toLowerCase()}-${maxResults}`;
    const now = Date.now();
    const cachedResult = searchCache.get(cacheKey);
    
    if (cachedResult && (now - cachedResult.timestamp) < CACHE_DURATION_MS) {
      console.log('Returning cached results for:', cacheKey);
      
      // Still update search count for anonymous users
      if (!isSubscribed) {
        const ipData = anonymousSearchCounts.get(userIP)!;
        anonymousSearchCounts.set(userIP, { 
          ...ipData, 
          count: ipData.count + 1,
          lastRequest: Date.now()
        });
      }
      
      return NextResponse.json(cachedResult.results);
    }

    const checker = new BusinessChecker();
    let results = await checker.analyzeBusinesses(query, location, radius || 15000, maxResults);

    // Apply premium filtering if user is subscribed and filterNoWebsite is enabled
    if (isSubscribed && filterNoWebsite) {
      results = results.filter(business => !business.website || business.website === 'N/A');
    }

    // For anonymous users, limit to 5 businesses but show all were found
    const limitedResults = isSubscribed ? results : results.slice(0, 5);
    const remainingCount = isSubscribed ? 0 : Math.max(0, results.length - 5);

    // Update search count for anonymous users
    if (!isSubscribed) {
      const ipData = anonymousSearchCounts.get(userIP)!;
      anonymousSearchCounts.set(userIP, { 
        ...ipData, 
        count: ipData.count + 1,
        lastRequest: Date.now()
      });
    }

    // Log search to database
    try {
      const payload = await getPayload({ config });
      await (payload as { create: (options: { collection: string; data: Record<string, unknown> }) => Promise<unknown> }).create({
        collection: 'searches',
        data: {
          query,
          location,
          user: userId || null,
          isAnonymous: !userId,
          ipAddress: userIP,
          results: JSON.stringify(results),
          businessesFound: results.length,
          websitesFound: results.filter(b => b.website && b.website !== 'N/A').length,
          accessibleWebsites: results.filter(b => b.website_status?.accessible).length,
          searchDate: new Date(),
        },
      });
      console.log('Search logged successfully');
    } catch (error) {
      console.error('Error logging search:', error);
    }

    // Calculate statistics based on ALL results found (but show limited results)
    const businessesWithWebsites = results.filter(b => b.website && b.website !== 'N/A').length;
    const accessibleWebsites = results.filter(b => b.website_status?.accessible).length;

    const response: SearchResults = {
      businesses: limitedResults,
      statistics: {
        total_businesses: results.length,
        businesses_with_websites: businessesWithWebsites,
        accessible_websites: accessibleWebsites,
        no_website_count: results.length - businessesWithWebsites,
        website_percentage: results.length > 0 ? Math.round((businessesWithWebsites / results.length) * 100 * 10) / 10 : 0,
        accessible_percentage: businessesWithWebsites > 0 ? Math.round((accessibleWebsites / businessesWithWebsites) * 100 * 10) / 10 : 0
      },
      payment_info: {
        is_free_user: !isSubscribed,
        total_found: results.length,
        showing: limitedResults.length,
        remaining: remainingCount,
        upgrade_price: 7.00,
        searches_remaining: isSubscribed ? null : Math.max(0, 2 - (anonymousSearchCounts.get(userIP)?.count || 0))
      }
    };

    // Cache the results to avoid duplicate API calls
    searchCache.set(cacheKey, { results: response, timestamp: now });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 
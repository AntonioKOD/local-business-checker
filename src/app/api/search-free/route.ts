/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { FreeClientCompass, SearchFilters } from '@/lib/business-checker-free';
import { getPayload } from 'payload';
import config from '@/payload.config';

// Base SearchResults interface
interface BaseSearchResults {
  businesses: any[];
  statistics: {
    total_businesses: number;
    businesses_with_websites: number;
    accessible_websites: number;
    no_website_count: number;
    website_percentage: number;
    accessible_percentage: number;
  };
  payment_info: {
    is_free_user: boolean;
    total_found: number;
    showing: number;
    remaining: number;
    upgrade_price: number;
    searches_remaining: number | null;
  };
}

// Extended SearchResults interface with premium features
interface SearchResults extends BaseSearchResults {
  statistics: BaseSearchResults['statistics'] & {
    average_rating: number;
    high_opportunity_count: number;
    market_analysis?: {
      market_saturation: string;
      website_adoption_rate: number;
      average_rating: number;
      competition_level: string;
      opportunity_score: number;
      top_competitors: any[];
      market_gaps: string[];
    } | null;
  };
}

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
}, 60 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const { query, location, userId, maxResults, filterNoWebsite, radiusKm, radius, minRating, minLeadScore } = await request.json();

    if (!query || !location) {
      return NextResponse.json(
        { error: 'Query and location are required' },
        { status: 400 }
      );
    }



    // Get user IP for rate limiting
    const userIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';

    // Check if user is subscribed (simplified check)
    const isSubscribed = !!userId;

    // Rate limiting for anonymous users
    if (!isSubscribed) {
      const now = Date.now();
      const userData = anonymousSearchCounts.get(userIP);
      
      if (userData) {
        // Reset counter if 24 hours have passed
        if (now - userData.lastReset > (SEARCH_LIMIT_RESET_HOURS * 60 * 60 * 1000)) {
          anonymousSearchCounts.set(userIP, { count: 0, lastReset: now, lastRequest: now });
        } else {
          // Check if user has exceeded search limit
          if (userData.count >= 3) {
            return NextResponse.json(
              { 
                error: 'Free search limit reached. Upgrade to premium for unlimited searches.',
                requiresSubscription: true
              },
              { status: 429 }
            );
          }
          
          // Check minimum interval between requests
          if (now - userData.lastRequest < MIN_REQUEST_INTERVAL_MS) {
            return NextResponse.json(
              { error: `Please wait ${Math.ceil((MIN_REQUEST_INTERVAL_MS - (now - userData.lastRequest)) / 1000)} seconds before searching again.` },
              { status: 429 }
            );
          }
        }
      } else {
        // First search from this IP
        anonymousSearchCounts.set(userIP, { count: 0, lastReset: now, lastRequest: now });
      }
    }

    // Create cache key
    const cacheKey = `${query}-${location}-${maxResults || 10}-${filterNoWebsite || false}-${radiusKm || radius || 15}`;
    const cachedResult = searchCache.get(cacheKey);
    const now = Date.now();
    
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

    const checker = new FreeClientCompass();
    
    // Create search filters based on request parameters
    const searchFilters: SearchFilters = {
      max_results: Math.min(maxResults || 10, 20),
      min_rating: minRating,
      has_website: filterNoWebsite ? false : undefined, // If filterNoWebsite is true, we want businesses WITHOUT websites
      min_reviews: 0 // Default minimum reviews
    };
    
    let results = await checker.searchBusinesses(query, location, searchFilters);

    // Apply premium filtering if user is subscribed
    if (isSubscribed) {
      if (filterNoWebsite) {
        results = results.filter(business => !business.website || business.website === 'N/A');
      }
      if (minRating && minRating > 0) {
        results = results.filter(business => {
          const rating = typeof business.rating === 'number' ? business.rating : 0;
          return rating >= minRating;
        });
      }
      if (minLeadScore && minLeadScore > 0) {
        results = results.filter(business => ((business as any).lead_score || 0) >= minLeadScore);
      }
    }

    // Limit results: 20 max total, 20 for subscribed users, 3 for free users
    const maxBusinesses = isSubscribed ? 20 : 3;
    const limitedResults = results.slice(0, maxBusinesses);
    const remainingCount = isSubscribed ? 0 : Math.max(0, results.length - 3);

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
          searchMethod: 'free_apis', // Track that this used free APIs
        },
      });
      console.log('Search logged successfully');
    } catch (error) {
      console.error('Error logging search:', error);
    }

    // Calculate enhanced statistics based on ALL results found
    const businessesWithWebsites = results.filter(b => b.website && b.website !== 'N/A').length;
    const accessibleWebsites = results.filter(b => b.website_status?.accessible).length;
    
    // Calculate average rating
    const ratings = results
      .map(b => typeof b.rating === 'number' ? b.rating : 0)
      .filter(r => r > 0);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    
    // Count high opportunity businesses (lead score > 70)
    const highOpportunityCount = results.filter(b => (b as any).lead_score && (b as any).lead_score > 70).length;
    
    // Generate market analysis for premium users
    let marketAnalysis = null;
    if (isSubscribed && results.length > 0) {
      marketAnalysis = checker.generateMarketAnalysis(results);
    }

    const response: SearchResults = {
      businesses: limitedResults,
      statistics: {
        total_businesses: results.length,
        businesses_with_websites: businessesWithWebsites,
        accessible_websites: accessibleWebsites,
        no_website_count: results.length - businessesWithWebsites,
        website_percentage: results.length > 0 ? Math.round((businessesWithWebsites / results.length) * 100 * 10) / 10 : 0,
        accessible_percentage: businessesWithWebsites > 0 ? Math.round((accessibleWebsites / businessesWithWebsites) * 100 * 10) / 10 : 0,
        // Enhanced statistics
        average_rating: Math.round(averageRating * 10) / 10,
        high_opportunity_count: highOpportunityCount,
        market_analysis: marketAnalysis
      },
      payment_info: {
        is_free_user: !isSubscribed,
        total_found: results.length,
        showing: limitedResults.length,
        remaining: remainingCount,
        upgrade_price: 20.00,
        searches_remaining: isSubscribed ? null : Math.max(0, 3 - (anonymousSearchCounts.get(userIP)?.count || 0))
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
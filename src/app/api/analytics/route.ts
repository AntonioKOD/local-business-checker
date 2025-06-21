import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

interface SearchRecord {
  searchDate: string;
  businessesFound: number;
  websitesFound: number;
  accessibleWebsites: number;
  location: string;
  query: string;
}

interface PayloadFindOptions {
  collection: string;
  where: Record<string, unknown>;
  limit: number;
  sort: string;
}

interface PayloadInstance {
  find: (options: PayloadFindOptions) => Promise<{ docs: SearchRecord[] }>;
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params or headers
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Get all searches for this user
    const userSearches = await (payload as PayloadInstance).find({
      collection: 'searches',
      where: {
        user: {
          equals: userId,
        },
      },
      limit: 1000, // Get a large number of searches for analytics
      sort: '-searchDate',
    });

    const searches = userSearches.docs;

    // Calculate analytics data
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Basic metrics
    const totalSearches = searches.length;
    const searchesThisMonth = searches.filter(search => 
      new Date(search.searchDate) >= thisMonth
    ).length;

    // Aggregate business and website data
    let totalBusinessesFound = 0;
    let totalWebsitesAnalyzed = 0;
    let totalAccessibleWebsites = 0;
    let totalInaccessibleWebsites = 0;
    let totalNoWebsite = 0;

    // Location and query tracking
    const locationCounts = new Map<string, { searches: number; businesses: number }>();
    const queryCounts = new Map<string, { searches: number; totalBusinesses: number }>();

    // Search history for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailySearchCounts = new Map<string, { searches: number; businessesFound: number }>();

    searches.forEach(search => {
      const searchDate = new Date(search.searchDate);
      
      // Aggregate totals
      totalBusinessesFound += search.businessesFound || 0;
      totalWebsitesAnalyzed += search.websitesFound || 0;
      totalAccessibleWebsites += search.accessibleWebsites || 0;
      
      // Calculate inaccessible and no website counts
      const businessesWithWebsites = search.websitesFound || 0;
      const accessibleWebsites = search.accessibleWebsites || 0;
      const inaccessibleWebsites = businessesWithWebsites - accessibleWebsites;
      const noWebsiteCount = (search.businessesFound || 0) - businessesWithWebsites;
      
      totalInaccessibleWebsites += inaccessibleWebsites;
      totalNoWebsite += noWebsiteCount;

      // Track locations
      const location = search.location || 'Unknown';
      const locationData = locationCounts.get(location) || { searches: 0, businesses: 0 };
      locationData.searches += 1;
      locationData.businesses += search.businessesFound || 0;
      locationCounts.set(location, locationData);

      // Track queries
      const query = search.query || 'Unknown';
      const queryData = queryCounts.get(query) || { searches: 0, totalBusinesses: 0 };
      queryData.searches += 1;
      queryData.totalBusinesses += search.businessesFound || 0;
      queryCounts.set(query, queryData);

      // Track daily searches for the last 30 days
      if (searchDate >= thirtyDaysAgo) {
        const dateKey = searchDate.toISOString().split('T')[0];
        const dailyData = dailySearchCounts.get(dateKey) || { searches: 0, businessesFound: 0 };
        dailyData.searches += 1;
        dailyData.businessesFound += search.businessesFound || 0;
        dailySearchCounts.set(dateKey, dailyData);
      }
    });

    // Convert maps to arrays and sort
    const topLocations = Array.from(locationCounts.entries())
      .map(([location, data]) => ({
        location,
        searches: data.searches,
        businesses: Math.round(data.businesses / data.searches),
      }))
      .sort((a, b) => b.searches - a.searches)
      .slice(0, 10);

    const topQueries = Array.from(queryCounts.entries())
      .map(([query, data]) => ({
        query,
        searches: data.searches,
        avgBusinesses: Math.round(data.totalBusinesses / data.searches),
      }))
      .sort((a, b) => b.searches - a.searches)
      .slice(0, 10);

    // Create search history for the last 30 days
    const searchHistory = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dailyData = dailySearchCounts.get(dateKey) || { searches: 0, businessesFound: 0 };
      
      searchHistory.push({
        date: dateKey,
        searches: dailyData.searches,
        businessesFound: dailyData.businessesFound,
      });
    }

    const analyticsData = {
      totalSearches,
      searchesThisMonth,
      businessesFound: totalBusinessesFound,
      websitesAnalyzed: totalWebsitesAnalyzed,
      accessibleWebsites: totalAccessibleWebsites,
      searchHistory,
      topLocations,
      topQueries,
      websiteHealth: {
        accessible: totalAccessibleWebsites,
        inaccessible: totalInaccessibleWebsites,
        noWebsite: totalNoWebsite,
      },
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 
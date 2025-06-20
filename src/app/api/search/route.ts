import { NextRequest, NextResponse } from 'next/server';
import { BusinessChecker, SearchResults } from '@/lib/business-checker';

export async function POST(request: NextRequest) {
  try {
    const { query, location, radius, hasPaid } = await request.json();

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

    const checker = new BusinessChecker();
    const results = await checker.analyzeBusinesses(query, location, radius || 15000);

    // Check if user has paid for full access
    const userHasPaid = hasPaid || false;

    // Limit results for free users
    const limitedResults = userHasPaid ? results : results.slice(0, 5);
    const remainingCount = userHasPaid ? 0 : Math.max(0, results.length - 5);

    // Prepare response with statistics
    const businessesWithWebsites = limitedResults.filter(b => b.website && b.website !== 'N/A').length;
    const accessibleWebsites = limitedResults.filter(b => b.website_status?.accessible).length;

    const response: SearchResults = {
      businesses: limitedResults,
      statistics: {
        total_businesses: limitedResults.length,
        businesses_with_websites: businessesWithWebsites,
        accessible_websites: accessibleWebsites,
        no_website_count: limitedResults.length - businessesWithWebsites,
        website_percentage: limitedResults.length > 0 ? Math.round((businessesWithWebsites / limitedResults.length) * 100 * 10) / 10 : 0,
        accessible_percentage: businessesWithWebsites > 0 ? Math.round((accessibleWebsites / businessesWithWebsites) * 100 * 10) / 10 : 0
      },
      payment_info: {
        is_free_user: !userHasPaid,
        total_found: results.length,
        showing: limitedResults.length,
        remaining: remainingCount,
        upgrade_price: 2.00
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 
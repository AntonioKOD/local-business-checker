import { NextRequest, NextResponse } from 'next/server';
import { BusinessChecker, SearchResults } from '@/lib/business-checker';

export async function POST(request: NextRequest) {
  try {
    const { query, location, radius, maxResults = 20, hasPaid } = await request.json();

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
    const results = await checker.analyzeBusinesses(query, location, radius || 15000, maxResults);

    // Check if user has paid for full access
    const userHasPaid = hasPaid || false;

    // Always return all results, but mark payment status
    const remainingCount = userHasPaid ? 0 : Math.max(0, results.length - 5);

    // Calculate statistics based on ALL results found
    const businessesWithWebsites = results.filter(b => b.website && b.website !== 'N/A').length;
    const accessibleWebsites = results.filter(b => b.website_status?.accessible).length;

    const response: SearchResults = {
      businesses: results, // Return all businesses
      statistics: {
        total_businesses: results.length,
        businesses_with_websites: businessesWithWebsites,
        accessible_websites: accessibleWebsites,
        no_website_count: results.length - businessesWithWebsites,
        website_percentage: results.length > 0 ? Math.round((businessesWithWebsites / results.length) * 100 * 10) / 10 : 0,
        accessible_percentage: businessesWithWebsites > 0 ? Math.round((accessibleWebsites / businessesWithWebsites) * 100 * 10) / 10 : 0
      },
      payment_info: {
        is_free_user: !userHasPaid,
        total_found: results.length,
        showing: userHasPaid ? results.length : 5,
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
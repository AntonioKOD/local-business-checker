/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { searchResults, fileName = 'business-search-results' } = await request.json();

    if (!searchResults) {
      return NextResponse.json(
        { error: 'Search results are required' },
        { status: 400 }
      );
    }

    // Create CSV content
    const csvContent = generateCSV(searchResults);
    
    // Create response with CSV file
    const response = new NextResponse(csvContent);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}.csv"`);
    
    return response;

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

function generateCSV(searchResults: any) {
  const { businesses, statistics } = searchResults;
  
  if (!businesses || !Array.isArray(businesses)) {
    return 'No businesses found';
  }

  // CSV headers
  const headers = [
    'Name',
    'Address',
    'Phone',
    'Website',
    'Rating',
    'Reviews',
    'Business Type',
    'Lead Score',
    'Website Status',
    'Accessible'
  ];

  // CSV rows
  const rows = businesses.map((business: any) => [
    business.name || 'N/A',
    business.address || 'N/A',
    business.phone || 'N/A',
    business.website || 'N/A',
    business.rating || 'N/A',
    business.reviews || 'N/A',
    business.business_type || 'N/A',
    business.lead_score || 'N/A',
    business.website_status?.status || 'N/A',
    business.website_status?.accessible ? 'Yes' : 'No'
  ]);

  // Add statistics as a summary section
  const summaryRows = [
    [],
    ['SEARCH SUMMARY'],
    [`Total Businesses Found: ${statistics?.total_businesses || 0}`],
    [`Businesses with Websites: ${statistics?.businesses_with_websites || 0}`],
    [`Accessible Websites: ${statistics?.accessible_websites || 0}`],
    [`Website Percentage: ${statistics?.website_percentage || 0}%`],
    [`Average Rating: ${statistics?.average_rating || 0}`],
    [`High Opportunity Businesses: ${statistics?.high_opportunity_count || 0}`],
    []
  ];

  // Combine headers, data, and summary
  const allRows = [
    headers,
    ...rows,
    ...summaryRows
  ];

  // Convert to CSV format
  return allRows.map(row => 
    row.map(cell => 
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    ).join(',')
  ).join('\n');
} 
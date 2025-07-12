import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    
    // Get all funnels
    const funnels = await payload.find({
      collection: 'funnels',
      limit: 100,
    });

    return NextResponse.json({
      success: true,
      totalFunnels: funnels.totalDocs,
      funnels: funnels.docs.map(funnel => ({
        id: funnel.id,
        title: funnel.title,
        slug: funnel.slug,
        isPublished: funnel.isPublished,
        createdAt: funnel.createdAt,
      }))
    });

  } catch (error) {
    console.error('Error fetching funnels for debug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnels', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
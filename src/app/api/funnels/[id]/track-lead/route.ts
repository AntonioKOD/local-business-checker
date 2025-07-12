import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config });
    const resolvedParams = await params;

    // Get current funnel
    const funnel = await payload.findByID({
      collection: 'funnels',
      id: resolvedParams.id,
    });

    if (!funnel) {
      return NextResponse.json(
        { error: 'Funnel not found' },
        { status: 404 }
      );
    }

    // Update analytics
    const currentViews = funnel.analytics?.views || 0;
    const currentLeads = funnel.analytics?.leads || 0;
    const newLeads = currentLeads + 1;
    const conversionRate = currentViews > 0 ? (newLeads / currentViews) * 100 : 0;

    await payload.update({
      collection: 'funnels',
      id: resolvedParams.id,
      data: {
        analytics: {
          views: currentViews,
          leads: newLeads,
          conversionRate: Math.round(conversionRate * 100) / 100,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Lead tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking lead:', error);
    return NextResponse.json(
      { error: 'Failed to track lead' },
      { status: 500 }
    );
  }
} 
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

    // Update analytics with retry logic for MongoDB write conflicts
    const currentViews = funnel.analytics?.views || 0;
    const currentLeads = funnel.analytics?.leads || 0;
    const conversionRate = currentViews > 0 ? (currentLeads / currentViews) * 100 : 0;

    let retries = 3;
    while (retries > 0) {
      try {
        await payload.update({
          collection: 'funnels',
          id: resolvedParams.id,
          data: {
            analytics: {
              views: currentViews + 1,
              leads: currentLeads,
              conversionRate: Math.round(conversionRate * 100) / 100,
            },
          },
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        retries--;
        if (error.code === 112 && retries > 0) { // MongoDB write conflict
          console.log(`Write conflict, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before retry
        } else {
          throw error; // Re-throw if not a write conflict or no retries left
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'View tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config });
    const { searchParams } = new URL(request.url);
    const bySlug = searchParams.get('bySlug') === 'true';
    const resolvedParams = await params;

    let funnel;
    
    if (bySlug) {
      // Find by slug
      console.log('Searching for funnel with slug:', resolvedParams.id); // Debug log
      
      if (!resolvedParams.id || resolvedParams.id === 'undefined') {
        return NextResponse.json(
          { error: 'Invalid funnel slug' },
          { status: 400 }
        );
      }
      
      const funnels = await payload.find({
        collection: 'funnels' as any,
        where: {
          slug: { equals: resolvedParams.id },
        },
      });
      
      console.log('Found funnels:', funnels.docs.length); // Debug log
      
      if (funnels.docs.length === 0) {
        return NextResponse.json(
          { error: 'Funnel not found' },
          { status: 404 }
        );
      }
      
      funnel = funnels.docs[0];
    } else {
      // Find by ID
      funnel = await payload.findByID({
        collection: 'funnels' as any,
        id: resolvedParams.id,
      });
    }

    if (!funnel) {
      return NextResponse.json(
        { error: 'Funnel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      funnel,
    });

  } catch (error) {
    console.error('Error fetching funnel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnel' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config });
    const body = await request.json();
    const resolvedParams = await params;

    // Update funnel
    const funnel = await payload.update({
      collection: 'funnels' as any,
      id: resolvedParams.id,
      data: body,
    });

    return NextResponse.json({
      success: true,
      funnel,
      message: 'Funnel updated successfully'
    });

  } catch (error) {
    console.error('Error updating funnel:', error);
    return NextResponse.json(
      { error: 'Failed to update funnel', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config });
    const resolvedParams = await params;

    // Find funnel by slug first if needed
    const { searchParams } = new URL(request.url);
    const bySlug = searchParams.get('bySlug') === 'true';
    
    let funnelId = resolvedParams.id;
    
    if (bySlug) {
      // Find by slug to get the ID
      const funnels = await payload.find({
        collection: 'funnels' as any,
        where: {
          slug: { equals: resolvedParams.id },
        },
        limit: 1,
      });

      if (funnels.docs.length === 0) {
        return NextResponse.json(
          { error: 'Funnel not found' },
          { status: 404 }
        );
      }

      funnelId = funnels.docs[0].id;
    }

    // Delete the funnel
    await payload.delete({
      collection: 'funnels' as any,
      id: funnelId,
    });

    return NextResponse.json({
      success: true,
      message: 'Funnel deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting funnel:', error);
    return NextResponse.json(
      { error: 'Failed to delete funnel', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function POST(request: NextRequest) {
  let body;
  try {
    const payload = await getPayload({ config });
    body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get current user from request
    let currentUser = null;
    try {
      const authResult = await payload.auth({
        headers: request.headers as Headers & { [key: string]: string }
      });
      currentUser = authResult.user;
    } catch (authError) {
      console.log('No authenticated user found, creating funnel without owner');
    }

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check if slug is unique
    const existingFunnel = await payload.find({
      collection: 'funnels' as any,
      where: {
        slug: { equals: body.slug },
      },
    });

    if (existingFunnel.docs.length > 0) {
      return NextResponse.json(
        { error: 'A funnel with this slug already exists' },
        { status: 400 }
      );
    }

    // Prepare funnel data
    const funnelData: any = {
      title: body.title,
      description: body.description || '',
      slug: body.slug,
      isPublished: body.isPublished || false,
      customCSS: body.customCSS || '',
    };

    // Assign owner if user is authenticated
    if (currentUser) {
      funnelData.owner = currentUser.id;
    }

    // Handle blocks if provided
    if (body.blocks && Array.isArray(body.blocks)) {
      funnelData.blocks = body.blocks;
    }

    // Handle theme if provided
    if (body.theme && typeof body.theme === 'object') {
      funnelData.theme = {
        primaryColor: body.theme.primaryColor || '#3B82F6',
        secondaryColor: body.theme.secondaryColor || '#1F2937',
        fontFamily: body.theme.fontFamily || 'Inter',
        borderRadius: body.theme.borderRadius || 8,
      };
    }

    // Handle legacy fields for backward compatibility
    if (body.tiptapContent) {
      funnelData.tiptapContent = body.tiptapContent;
    }

    if (body.leadFormFields && Array.isArray(body.leadFormFields)) {
      funnelData.leadFormFields = body.leadFormFields;
    }

    // Create funnel
    const funnel = await payload.create({
      collection: 'funnels' as any,
      data: funnelData,
    });

    return NextResponse.json({
      success: true,
      funnel,
      message: 'Funnel created successfully'
    });

  } catch (error) {
    console.error('Error creating funnel:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: body || 'No body available'
    });
    return NextResponse.json(
      { error: 'Failed to create funnel', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  let body;
  try {
    const payload = await getPayload({ config });
    body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Funnel ID is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.slug) updateData.slug = body.slug;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
    if (body.customCSS !== undefined) updateData.customCSS = body.customCSS;

    // Handle blocks if provided
    if (body.blocks && Array.isArray(body.blocks)) {
      updateData.blocks = body.blocks;
    }

    // Handle theme if provided
    if (body.theme && typeof body.theme === 'object') {
      updateData.theme = {
        primaryColor: body.theme.primaryColor || '#3B82F6',
        secondaryColor: body.theme.secondaryColor || '#1F2937',
        fontFamily: body.theme.fontFamily || 'Inter',
        borderRadius: body.theme.borderRadius || 8,
      };
    }

    // Update funnel
    const funnel = await payload.update({
      collection: 'funnels' as any,
      id: body.id,
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      funnel,
      message: 'Funnel updated successfully'
    });

  } catch (error) {
    console.error('Error updating funnel:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: body || 'No body available'
    });
    return NextResponse.json(
      { error: 'Failed to update funnel', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isPublished = searchParams.get('isPublished');
    const owner = searchParams.get('owner');

    let query: any = {};

    if (isPublished !== null) {
      query.isPublished = { equals: isPublished === 'true' };
    }

    if (owner) {
      query.owner = { equals: owner };
    }

    const funnels = await payload.find({
      collection: 'funnels' as any,
      where: query,
      page,
      limit,
      sort: '-createdAt',
    });

    return NextResponse.json({
      success: true,
      funnels: funnels.docs,
      totalDocs: funnels.totalDocs,
      totalPages: funnels.totalPages,
      page: funnels.page,
      hasNextPage: funnels.hasNextPage,
      hasPrevPage: funnels.hasPrevPage,
    });

  } catch (error) {
    console.error('Error fetching funnels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnels' },
      { status: 500 }
    );
  }
} 
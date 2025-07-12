/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const payload = await getPayload({ config });

    let where: any = {};
    
    if (type) {
      where.type = { equals: type };
    }
    
    if (status) {
      where.status = { equals: status };
    }
    
    if (priority) {
      where.priority = { equals: priority };
    }

    const activities = await payload.find({
      collection: 'activities' as any,
      page,
      limit,
      sort: '-date',
      where,
      depth: 1, // Include client data
    });

    return NextResponse.json({
      success: true,
      activities: activities.docs,
      totalDocs: activities.totalDocs,
      totalPages: activities.totalPages,
      page: activities.page,
      hasNextPage: activities.hasNextPage,
      hasPrevPage: activities.hasPrevPage,
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const payload = await getPayload({ config });

    const activity = await payload.create({
      collection: 'activities' as any,
      data: body,
    });

    return NextResponse.json({
      success: true,
      activity,
    });

  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
} 
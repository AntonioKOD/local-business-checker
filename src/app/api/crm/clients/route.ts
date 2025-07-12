import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const industry = searchParams.get('industry');

    const payload = await getPayload({ config });

    let where: any = {};
    
    if (status) {
      where.status = { equals: status };
    }
    
    if (industry) {
      where.industry = { equals: industry };
    }

    const clients = await payload.find({
      collection: 'clients',
      page,
      limit,
      sort: '-lastContact',
      where,
    });

    return NextResponse.json({
      success: true,
      clients: clients.docs,
      totalDocs: clients.totalDocs,
      totalPages: clients.totalPages,
      page: clients.page,
      hasNextPage: clients.hasNextPage,
      hasPrevPage: clients.hasPrevPage,
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const payload = await getPayload({ config });

    const client = await payload.create({
      collection: 'clients',
      data: body,
    });

    return NextResponse.json({
      success: true,
      client,
    });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
} 
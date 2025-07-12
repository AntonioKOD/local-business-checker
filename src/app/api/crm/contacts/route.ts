/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const role = searchParams.get('role');

    const payload = await getPayload({ config });


    let where: any = {};
    
    if (status) {
      where.status = { equals: status };
    }
    
    if (role) {
      where.role = { equals: role };
    }

    const contacts = await payload.find({
      collection: 'contacts' as any,
      page,
      limit,
      sort: '-lastContact',
      where,
      depth: 1, // Include client data
    });

    return NextResponse.json({
      success: true,
      contacts: contacts.docs,
      totalDocs: contacts.totalDocs,
      totalPages: contacts.totalPages,
      page: contacts.page,
      hasNextPage: contacts.hasNextPage,
      hasPrevPage: contacts.hasPrevPage,
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const payload = await getPayload({ config });

    const contact = await payload.create({
      collection: 'contacts' as any,
      data: body,
    });

    return NextResponse.json({
      success: true,
      contact,
    });

  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
} 
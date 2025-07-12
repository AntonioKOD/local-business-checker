import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // First, get all funnels created by this user
    const userFunnels = await payload.find({
      collection: 'funnels' as any,
      where: {
        owner: {
          equals: userId,
        },
      },
    });

    const funnelIds = userFunnels.docs.map(funnel => funnel.id);
    const funnelMap = new Map();
    userFunnels.docs.forEach(funnel => {
      funnelMap.set(funnel.id, funnel);
    });

    // Then, get all leads from these funnels
    const leads = await payload.find({
      collection: 'clientleads' as any,
      page,
      limit,
      sort: '-createdAt',
      where: {
        funnelId: {
          in: funnelIds,
        },
      },
    });

    // Populate leads with funnel information
    const populatedLeads = leads.docs.map(lead => {
      const funnel = funnelMap.get(lead.funnelId);
      return {
        ...lead,
        funnel: funnel ? {
          id: funnel.id,
          title: funnel.title,
          slug: funnel.slug,
          isPublished: funnel.isPublished,
        } : null,
        // Ensure funnelTitle is available
        funnelTitle: lead.funnelTitle || (funnel ? funnel.title : 'Unknown Funnel'),
      };
    });

    return NextResponse.json({
      success: true,
      leads: populatedLeads,
      totalDocs: leads.totalDocs,
      totalPages: leads.totalPages,
      page: leads.page,
      hasNextPage: leads.hasNextPage,
      hasPrevPage: leads.hasPrevPage,
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const payload = await getPayload({ config });

    // Convert lead to client/contact
    const leadData = {
      companyName: body.businessName || 'Unknown Company',
      industry: 'other',
      website: body.businessWebsite || '',
      phone: body.businessPhone || '',
      address: {
        street: body.businessAddress || '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
      },
      companySize: '1-10',
      annualRevenue: 'under-1m',
      status: 'lead',
      source: 'funnel-lead',
      notes: `Converted from lead: ${body.name} (${body.email})`,
      lastContact: new Date().toISOString(),
    };

    // Create client
    const client = await payload.create({
      collection: 'clients' as any,
      data: leadData,
    });

    // Create contact
    const contactData = {
      fullName: body.name,
      email: body.email,
      phone: body.businessPhone || '',
      title: 'Lead',
      role: 'decision-maker',
      status: 'active',
      source: 'funnel-lead',
      client: client.id,
      isPrimary: true,
      lastContact: new Date().toISOString(),
    };

    const contact = await payload.create({
      collection: 'contacts' as any,
      data: contactData,
    });

    return NextResponse.json({
      success: true,
      client,
      contact,
    });

  } catch (error) {
    console.error('Error converting lead:', error);
    return NextResponse.json(
      { error: 'Failed to convert lead' },
      { status: 500 }
    );
  }
} 
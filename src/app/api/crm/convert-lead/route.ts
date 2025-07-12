import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, userId } = body;
    
    if (!leadId || !userId) {
      return NextResponse.json(
        { error: 'Lead ID and User ID are required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Get the lead data
    const lead = await payload.findByID({
      collection: 'clientleads' as any,
      id: leadId,
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Determine company name based on lead source
    let companyName = 'Unknown Company';
    if (lead.source === 'funnel' && lead.funnelTitle) {
      companyName = `${lead.name} - ${lead.funnelTitle}`;
    } else if (lead.source === 'funnel') {
      companyName = `${lead.name} - Funnel Lead`;
    } else {
      companyName = lead.name || 'Unknown Company';
    }

    // Create client data
    const clientData = {
      companyName,
      industry: 'other',
      website: '',
      phone: lead.phone || '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
      },
      companySize: '1-10',
      annualRevenue: 'under-1m',
      status: 'lead',
      source: 'funnel-lead',
      notes: `Converted from lead: ${lead.name} (${lead.email})${lead.funnelTitle ? ` from funnel: ${lead.funnelTitle}` : ''}`,
      lastContact: new Date().toISOString(),
    };

    // Create client
    const client = await payload.create({
      collection: 'clients' as any,
      data: clientData,
    });

    // Create contact data
    const contactData = {
      fullName: lead.name,
      email: lead.email,
      phone: lead.phone || '',
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

    // Update lead status to converted
    await payload.update({
      collection: 'clientleads' as any,
      id: leadId,
      data: {
        status: 'converted',
      },
    });

    return NextResponse.json({
      success: true,
      client,
      contact,
      clientName: client.companyName,
      message: 'Lead successfully converted to client and contact',
    });

  } catch (error) {
    console.error('Error converting lead:', error);
    return NextResponse.json(
      { error: 'Failed to convert lead' },
      { status: 500 }
    );
  }
} 
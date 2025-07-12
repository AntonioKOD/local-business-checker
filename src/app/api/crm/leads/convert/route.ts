/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId } = body;
    
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

    // Create client from lead data
    const clientData = {
      companyName: lead.name || 'Unknown Company',
      industry: 'other',
      website: '',
      phone: '',
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
      source: 'funnel-conversion',
      notes: `Converted from lead: ${lead.name} (${lead.email}) - Funnel: ${lead.funnelTitle}`,
      lastContact: new Date().toISOString(),
    };

    const client = await payload.create({
      collection: 'clients' as any,
      data: clientData,
    });

    // Create contact from lead data
    const contactData = {
      fullName: lead.name,
      email: lead.email,
      phone: '',
      title: 'Lead',
      role: 'decision-maker',
      status: 'active',
      source: 'funnel-conversion',
      client: client.id,
      isPrimary: true,
      lastContact: new Date().toISOString(),
    };

    const contact = await payload.create({
      collection: 'contacts' as any,
      data: contactData,
    });

    // Update the lead status to converted
    await payload.update({
      collection: 'clientleads' as any,
      id: leadId,
      data: {
        status: 'converted',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Lead successfully converted to client and contact',
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
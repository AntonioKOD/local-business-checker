/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

interface LeadData {
  name: string;
  email: string;
  source?: string;
  funnelId?: string;
  funnelTitle?: string;
  funnelStep?: number;
  status?: string;
}

// Helper function to extract name and email from form data
function extractLeadInfo(formData: any): { name: string; email: string } {
  // Common field name mappings
  const nameFields = ['name', 'full name', 'fullname', 'first name', 'firstname', 'full_name'];
  const emailFields = ['email', 'email address', 'emailaddress', 'e-mail', 'e_mail'];
  
  let name = '';
  let email = '';
  
  // First try to find exact matches
  if (formData.name) name = formData.name;
  if (formData.email) email = formData.email;
  
  // If not found, search through all form data for common field names
  if (!name || !email) {
    for (const [key, value] of Object.entries(formData)) {
      const lowerKey = key.toLowerCase();
      
      if (!name && nameFields.some(field => lowerKey.includes(field))) {
        name = value as string;
      }
      
      if (!email && emailFields.some(field => lowerKey.includes(field))) {
        email = value as string;
      }
    }
  }
  
  return { name, email };
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
    
    console.log('Received lead data:', body);

    let name = '';
    let email = '';
    let funnelTitle = '';

    // Handle different data formats
    if (body.name && body.email) {
      // Direct name/email format
      name = body.name;
      email = body.email;
    } else if (body.formData) {
      // Form data format from funnels
      const extracted = extractLeadInfo(body.formData);
      name = extracted.name;
      email = extracted.email;
    } else {
      // Try to extract from the body itself
      const extracted = extractLeadInfo(body);
      name = extracted.name;
      email = extracted.email;
    }

    // Validate required fields
    if (!name || !email) {
      console.error('Missing required fields. Received data:', body);
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Initialize PayloadCMS
    const payload = await getPayload({ config });

    // If funnelId is provided, fetch the funnel title
    if (body.funnelId) {
      try {
        console.log('Fetching funnel with ID:', body.funnelId);
        const funnel = await payload.findByID({
          collection: 'funnels' as any,
          id: body.funnelId,
        });
        console.log('Found funnel:', funnel);
        funnelTitle = funnel.title;
        console.log('Funnel title set to:', funnelTitle);
      } catch (error) {
        console.error('Error fetching funnel title:', error);
        console.error('Funnel ID was:', body.funnelId);
        
        // Try alternative approach - search by ID
        try {
          const funnels = await payload.find({
            collection: 'funnels' as any,
            where: {
              id: {
                equals: body.funnelId,
              },
            },
            limit: 1,
          });
          
          if (funnels.docs.length > 0) {
            funnelTitle = funnels.docs[0].title;
            console.log('Found funnel via search:', funnelTitle);
          } else {
            console.log('No funnel found with ID:', body.funnelId);
            funnelTitle = 'Unknown Funnel';
          }
        } catch (searchError) {
          console.error('Error searching for funnel:', searchError);
          funnelTitle = 'Unknown Funnel';
        }
      }
    }

    // Create lead record with all possible fields
    const leadData: LeadData = {
      name,
      email,
      source: body.source || 'funnel',
      funnelId: body.funnelId || undefined,
      funnelTitle: funnelTitle || body.funnelTitle || undefined,
      funnelStep: body.funnelStep || undefined,
      status: 'new',
    };

    console.log('Creating lead with data:', leadData);

    const lead = await payload.create({
      collection: 'clientleads' as any, // Updated to use new collection
      data: leadData,
    });

    console.log('Lead created successfully:', lead.id);

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        name: leadData.name,
        email: leadData.email,
        source: leadData.source,
        funnelId: leadData.funnelId,
        funnelTitle: leadData.funnelTitle,
        funnelStep: leadData.funnelStep,
        status: leadData.status,
      },
    });

  } catch (error: unknown) {
    console.error('Error creating lead:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: body,
    });

    return NextResponse.json(
      { 
        error: 'Failed to create lead',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Initialize PayloadCMS
    const payload = await getPayload({ config });

    const leads = await payload.find({
      collection: 'clientleads' as any, // Updated to use new collection
      page,
      limit,
      sort: '-createdAt',
    });

    return NextResponse.json({
      success: true,
      leads: leads.docs,
      totalDocs: leads.totalDocs,
      totalPages: leads.totalPages,
      page: leads.page,
      hasNextPage: leads.hasNextPage,
      hasPrevPage: leads.hasPrevPage,
    });

  } catch (error: unknown) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
} 
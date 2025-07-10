import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import payloadConfig from '@/payload.config';

// Initialize Payload
const payload = await getPayload({ config: payloadConfig });

export async function POST(req: NextRequest) {
  try {
    const { business, userId } = await req.json() as { business: Record<string, unknown>, userId: string };

    if (!business || !userId) {
      return NextResponse.json({ error: 'Missing business data or user ID' }, { status: 400 });
    }

    // Check if a lead with this place_id already exists for this user
    const { docs: existingLeads } = await payload.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'leads' as any,
      where: {
        placeId: {
          equals: business.place_id as string,
        },
        owner: {
          equals: userId,
        },
      },
      limit: 1,
    });

    if (existingLeads.length > 0) {
      return NextResponse.json({ error: 'This business is already in your lead funnel.' }, { status: 409 });
    }

    const newLead = await payload.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'leads' as any,
      data: {
        businessName: business.name as string,
        placeId: business.place_id as string,
        status: 'new', // Initial status
        leadScore: (business.lead_score as number) || 0,
        owner: userId,
        businessData: business, // Store the full business object
      },
    });

    return NextResponse.json(newLead, { status: 201 });

  } catch (error) {
    console.error('Failed to create lead:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to create lead.', details: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { docs: leads } = await payload.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'leads' as any,
      where: {
        owner: {
          equals: userId,
        },
      },
      // You might want to add pagination here in a real-world scenario
      limit: 1000, 
    });

    return NextResponse.json(leads);

  } catch (error) {
    console.error('Failed to fetch leads:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to fetch leads.', details: errorMessage }, { status: 500 });
  }
} 
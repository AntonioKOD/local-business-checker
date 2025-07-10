import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import payloadConfig from '@/payload.config';

const payload = await getPayload({ config: payloadConfig });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
  }

  try {
    const { status, notes, isWatched } = await req.json();

    if (!status && !notes && isWatched === undefined) {
      return NextResponse.json({ error: 'Status, notes, or isWatched is required' }, { status: 400 });
    }
    
    const dataToUpdate: { status?: string, notes?: string, isWatched?: boolean, contactedDate?: string } = {};

    if (status) {
      dataToUpdate.status = status;
      if (status === 'contacted') {
        // Also set contactedDate if it's not already set.
        // This logic could be more complex, e.g., don't overwrite existing date.
        dataToUpdate.contactedDate = new Date().toISOString();
      }
    }

    if (notes) {
      dataToUpdate.notes = notes;
    }

    if (isWatched !== undefined) {
      dataToUpdate.isWatched = isWatched;
    }

    const updatedLead = await payload.update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'leads' as any,
      id: id,
      data: dataToUpdate,
    });

    if (!updatedLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLead);

  } catch (error) {
    console.error(`Failed to update lead ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to update lead.', details: errorMessage }, { status: 500 });
  }
} 
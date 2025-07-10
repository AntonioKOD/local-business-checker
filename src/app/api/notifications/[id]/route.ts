import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import payloadConfig from '@/payload.config';

const payload = await getPayload({ config: payloadConfig });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
  }

  try {
    const { isRead } = await req.json();

    if (isRead === undefined) {
      return NextResponse.json({ error: 'isRead is required' }, { status: 400 });
    }

    // In a real app, you would also verify that the user making the request
    // has permission to update this notification.

    const updatedNotification = await payload.update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'notifications' as any,
      id: id,
      data: {
        isRead,
      },
    });

    if (!updatedNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json(updatedNotification);

  } catch (error) {
    console.error(`Failed to update notification ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to update notification.', details: errorMessage }, { status: 500 });
  }
} 
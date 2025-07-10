import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import payloadConfig from '@/payload.config';

const payload = await getPayload({ config: payloadConfig });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const unread = searchParams.get('unread');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const where: Record<string, unknown> = {
      user: {
        equals: userId,
      },
    };

    if (unread === 'true') {
      where.isRead = {
        equals: false,
      };
    }

    const { docs: notifications } = await payload.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'notifications' as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: where as any,
      sort: '-createdAt',
      limit: 50,
    });

    return NextResponse.json(notifications);

  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to fetch notifications.', details: errorMessage }, { status: 500 });
  }
} 
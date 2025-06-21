import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionStatus: string;
}

interface FindOptions {
  collection: string;
  where: Record<string, unknown>;
}

interface PayloadInstance {
  find: (options: FindOptions) => Promise<{ docs: UserRecord[] }>;
}

export async function POST(request: NextRequest) {
  try {
    const { email, customer_id } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Check if user exists by email or customer ID
    const users = await (payload as PayloadInstance).find({
      collection: 'users',
      where: {
        or: [
          {
            email: {
              equals: email,
            },
          },
          {
            stripeCustomerId: {
              equals: customer_id,
            },
          },
        ],
      },
    });

    if (users.docs.length > 0) {
      const user = users.docs[0] as unknown as UserRecord;
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          subscriptionStatus: user.subscriptionStatus,
        },
      });
    }

    return NextResponse.json({ user: null });

  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
} 
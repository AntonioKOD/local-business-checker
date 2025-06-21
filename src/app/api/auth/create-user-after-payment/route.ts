import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import jwt from 'jsonwebtoken';

interface FindOptions {
  collection: string;
  where: Record<string, unknown>;
}

interface CreateOptions {
  collection: string;
  data: Record<string, unknown>;
}

interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionStatus: string;
}

interface PayloadInstance {
  find: (options: FindOptions) => Promise<{ docs: UserRecord[] }>;
  create: (options: CreateOptions) => Promise<UserRecord>;
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, customer_id, password } = await request.json();

    if (!email || !firstName || !lastName || !customer_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Check if user already exists
    const existingUsers = await (payload as PayloadInstance).find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (existingUsers.docs.length > 0) {
      const user = existingUsers.docs[0];
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: (user as unknown as { firstName: string }).firstName,
          lastName: (user as unknown as { lastName: string }).lastName,
          subscriptionStatus: (user as unknown as { subscriptionStatus: string }).subscriptionStatus,
        },
      });
    }

    // Use provided password or generate a temporary one
    const userPassword = password || Math.random().toString(36).slice(-12) + 'A1!'; // Ensure it meets requirements
    
    // Create user in PayloadCMS without subscription for now
    // We'll handle subscription creation later when we have proper payment method setup
    const newUser = await (payload as PayloadInstance).create({
      collection: 'users',
      data: {
        email,
        password: userPassword,
        firstName,
        lastName,
        stripeCustomerId: customer_id,
        subscriptionId: '', // Will be updated later
        subscriptionStatus: 'active', // They paid for this month
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now
        totalSearches: 0,
      },
    });

    // Generate JWT token for automatic login
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Create response with user data and token
    const response = NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: (newUser as unknown as { firstName: string }).firstName,
        lastName: (newUser as unknown as { lastName: string }).lastName,
        subscriptionStatus: (newUser as unknown as { subscriptionStatus: string }).subscriptionStatus,
      },
      token,
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Create user after payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import jwt from 'jsonwebtoken';

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
  create: (options: CreateOptions) => Promise<UserRecord>;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (existingUsers.docs.length > 0) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await (payload as PayloadInstance).create({
      collection: 'users',
      data: {
        email,
        password,
        firstName,
        lastName,
        subscriptionStatus: 'inactive', // Regular registration, not premium
        stripeCustomerId: '',
        subscriptionId: '',
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

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        subscriptionStatus: newUser.subscriptionStatus,
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
} 
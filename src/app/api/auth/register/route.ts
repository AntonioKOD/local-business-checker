import { NextResponse } from 'next/server';
import { rateLimitMiddleware, rateLimitConfigs } from '@/lib/rate-limit';
import payload from 'payload';
import jwt from 'jsonwebtoken';

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
  subscriptionStatus: string;
}

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request, rateLimitConfigs.AUTH);
    if (rateLimitResult) return rateLimitResult;

    const { email, password, firstName, lastName } = await request.json();

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email.toLowerCase(),
        },
      },
    });

    if (existingUser.totalDocs > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create user
    const userData: CreateUserData = {
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      roles: ['user'],
      subscriptionStatus: 'free'
    };

    const newUser = await payload.create({
      collection: 'users',
      data: userData,
    });

    // Generate JWT token
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
        subscriptionStatus: (newUser as unknown as { subscriptionStatus?: string }).subscriptionStatus || 'free',
      },
      token,
      message: 'Account created successfully'
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { rateLimitMiddleware, rateLimitConfigs } from '@/lib/rate-limit';
import payload from 'payload';

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  subscriptionStatus?: string;
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

    await payload.create({
      collection: 'users',
      data: userData,
    });

    // Log the user in
    const result = await payload.login({
      collection: 'users',
      data: {
        email: email.toLowerCase(),
        password,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { rateLimitMiddleware, rateLimitConfigs } from '@/lib/rate-limit';
import payload from 'payload';

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request, rateLimitConfigs.AUTH);
    if (rateLimitResult) return rateLimitResult;

    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Attempt login
    try {
      const result = await payload.login({
        collection: 'users',
        data: {
          email: email.toLowerCase(),
          password,
        },
      });

      return NextResponse.json(result);
    } catch (loginError) {
      // Don't expose specific error messages for security
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
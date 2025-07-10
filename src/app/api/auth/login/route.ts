import { NextResponse } from 'next/server';
import { rateLimitMiddleware, rateLimitConfigs } from '@/lib/rate-limit';
import payload from 'payload';
import jwt from 'jsonwebtoken';

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

    // Attempt login using PayloadCMS
    const result = await payload.login({
      collection: 'users',
      data: {
        email: email.toLowerCase(),
        password,
      },
    });

    if (!result.user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token for the frontend
    const token = jwt.sign(
      { 
        userId: result.user.id, 
        email: result.user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Create response with user data and token
    const response = NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: (result.user as unknown as { firstName: string }).firstName,
        lastName: (result.user as unknown as { lastName: string }).lastName,
        subscriptionStatus: (result.user as unknown as { subscriptionStatus?: string }).subscriptionStatus || 'free',
      },
      token,
      message: 'Login successful'
    });

    // Set HTTP-only cookie for secure authentication
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific PayloadCMS authentication errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid credentials') || error.message.includes('password')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 
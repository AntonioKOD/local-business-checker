import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; email: string };
    
    if (!decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const payload = await getPayload({ config });

    // Get user from database
    const user = await payload.findByID({
      collection: 'users',
      id: decoded.userId,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: (user as unknown as { firstName: string }).firstName,
        lastName: (user as unknown as { lastName: string }).lastName,
        subscriptionStatus: (user as unknown as { subscriptionStatus: string }).subscriptionStatus,
      },
    });

  } catch (error) {
    // Only log unexpected errors, not invalid/expired tokens which are normal
    if (error instanceof jwt.JsonWebTokenError) {
      // Token is invalid/expired - this is normal, don't log as error
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    } else {
      // Actual unexpected error - log this
      console.error('Token verification error:', error);
      return NextResponse.json(
        { error: 'Token verification failed' },
        { status: 500 }
      );
    }
  }
} 
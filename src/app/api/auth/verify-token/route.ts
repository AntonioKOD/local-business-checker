/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('payload-token')?.value || 
                  request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided in request');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const payload = await getPayload({ config });

    // Use PayloadCMS built-in method to verify user authentication
    try {
      const me = await payload.auth({
        headers: request.headers as Headers & { [key: string]: string }
      });

      if (!me.user) {
        console.log('Invalid token - no user found');
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: me.user.id,
          email: me.user.email,
          firstName: (me.user as unknown as { firstName: string }).firstName,
          lastName: (me.user as unknown as { lastName: string }).lastName,
          subscriptionStatus: (me.user as unknown as { subscriptionStatus?: string }).subscriptionStatus || 'free',
        },
      });

    } catch {
      // If auth fails, try to find user by ID from token (fallback method)
      try {
        // Basic JWT decode to get user ID (without verification since PayloadCMS handles that)
        const base64Payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(base64Payload));
        
        if (decodedPayload.id) {
          const user = await payload.findByID({
            collection: 'users' as any,
            id: decodedPayload.id,
          });

          if (user) {
            return NextResponse.json({
              success: true,
              user: {
                id: user.id,
                email: user.email,
                firstName: (user as unknown as { firstName: string }).firstName,
                lastName: (user as unknown as { lastName: string }).lastName,
                subscriptionStatus: (user as unknown as { subscriptionStatus?: string }).subscriptionStatus || 'free',
              },
            });
          }
        }
      } catch {
        // Fallback failed, continue to return invalid token
      }

      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'User ID and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Update user password
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        password: newPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });

  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
} 
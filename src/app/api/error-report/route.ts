import { NextResponse } from 'next/server';

interface ErrorReport {
  type: string;
  email: string;
  customer_id: string;
  payment_intent_id: string;
  error: string;
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as ErrorReport;
    
    // Validate required fields
    if (!data.type || !data.email || !data.customer_id || !data.payment_intent_id || !data.error) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Log to your error tracking service (e.g., Sentry)
    // 2. Send notification to support team
    // 3. Store in database for tracking
    
    // For now, we'll just log to console in production
    // In a real app, replace this with proper error tracking
    console.error('Payment/Account Creation Error:', {
      timestamp: new Date().toISOString(),
      ...data
    });

    // Send notification to support (implement this based on your notification system)
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment_error',
          title: 'Payment/Account Creation Error',
          message: `Error occurred for user ${data.email}. Type: ${data.type}. Error: ${data.error}`,
          metadata: {
            customer_id: data.customer_id,
            payment_intent_id: data.payment_intent_id,
            error_type: data.type
          },
          priority: 'high'
        })
      });
    } catch (notificationError) {
      console.error('Failed to send error notification:', notificationError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling error report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Payment processing not configured' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    const { payment_intent_id } = await request.json();

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: 'Payment intent ID required' },
        { status: 400 }
      );
    }

    // Retrieve the payment intent to confirm it was successful
    const intent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (intent.status === 'succeeded') {
      // TODO: Grant full access to the user
      // You can implement session management or database updates here

      return NextResponse.json({
        success: true,
        message: 'Payment successful! You now have access to all search results.'
      });
    } else {
      return NextResponse.json(
        { error: 'Payment was not successful' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: `Payment confirmation error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 
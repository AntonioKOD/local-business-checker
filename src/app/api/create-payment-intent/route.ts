import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Payment processing not configured' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    // Create a PaymentIntent with the order amount and currency
    const intent = await stripe.paymentIntents.create({
      amount: 200, // $2.00 in cents
      currency: 'usd',
      description: 'Unlock all business search results',
      metadata: { feature: 'full_search_access' }
    });

    return NextResponse.json({
      client_secret: intent.client_secret,
      publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: `Payment error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 
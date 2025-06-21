import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Payment processing not configured' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  
  try {
    const { email, firstName, lastName, password } = await request.json();

    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: 'Email, first name, last name, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Create Stripe customer first
    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      metadata: {
        firstName,
        lastName,
      },
    });

    // Create a simple payment intent for the first month
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000, // $20.00 in cents
      currency: 'usd',
      customer: customer.id,
      setup_future_usage: 'off_session', // Save payment method for future use
      metadata: {
        email,
        firstName,
        lastName,
        password,
        type: 'subscription_first_payment'
      },
    });

    console.log('Payment intent created:', {
      payment_intent_id: paymentIntent.id,
      customer_id: customer.id,
      has_client_secret: !!paymentIntent.client_secret
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      customer_id: customer.id,
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
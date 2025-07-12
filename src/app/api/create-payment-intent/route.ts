import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimitMiddleware, rateLimitConfigs } from '@/lib/rate-limit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request, rateLimitConfigs.PAYMENT);
    if (rateLimitResult) return rateLimitResult;

    const { email, firstName, lastName, password } = await request.json();

    // Validate required fields
    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Create or get customer
    let customer;
    const existingCustomers = await stripe.customers.list({ email });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`,
        metadata: {
          firstName,
          lastName
        }
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 700, // $7.00
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        email,
        firstName,
        lastName,
        type: 'subscription_setup'
      }
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      customer_id: customer.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
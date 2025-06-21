/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { payment_intent_id } = await request.json();

    if (!payment_intent_id) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Get the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    if (paymentIntent.metadata?.type === 'subscription_first_payment') {
      const customer = await stripe.customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;
      const payload = await getPayload({ config });

      // Check if user already exists
      const existingUsers = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: customer.email,
          },
        },
      });

      if (existingUsers.docs.length === 0) {
        // Generate a temporary password for the user
        const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'; // Ensure it meets requirements
        
        // Create user without subscription for now
                  const newUser = await (payload as any).create({
            collection: 'users',
            data: {
              email: customer.email!,
              password: tempPassword,
              firstName: customer.metadata?.firstName || paymentIntent.metadata?.firstName || '',
              lastName: customer.metadata?.lastName || paymentIntent.metadata?.lastName || '',
              stripeCustomerId: customer.id,
              subscriptionId: '', // Will be updated later
              subscriptionStatus: 'active', // They paid for this month
              subscriptionStartDate: new Date(),
              subscriptionEndDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now
              totalSearches: 0,
            },
          });

        return NextResponse.json({
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: (newUser as any).firstName,
            lastName: (newUser as any).lastName,
          },
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'User already exists',
          user: {
            id: existingUsers.docs[0].id,
            email: existingUsers.docs[0].email,
            firstName: (existingUsers.docs[0] as any).firstName,
            lastName: (existingUsers.docs[0] as any).lastName,
          },
        });
      }
    }

    return NextResponse.json({ error: 'Invalid payment intent' }, { status: 400 });

  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Test webhook failed' },
      { status: 500 }
    );
  }
} 
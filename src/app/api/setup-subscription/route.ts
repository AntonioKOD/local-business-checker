/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { userId, customerId } = await request.json();

    if (!userId || !customerId) {
      return NextResponse.json(
        { error: 'User ID and Customer ID are required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // Get user from PayloadCMS
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a subscription
    if ((user as any).subscriptionId) {
      return NextResponse.json({
        success: true,
        message: 'User already has a subscription',
        subscriptionId: (user as any).subscriptionId,
      });
    }

    // Get customer's default payment method
    const customer = await stripe.customers.retrieve(customerId);
    
    if (typeof customer === 'string' || customer.deleted) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Only set up subscription if customer has a default payment method
    if (customer.default_source || customer.invoice_settings?.default_payment_method) {
      // Create product and price
      const product = await stripe.products.create({
        name: 'Client Compass Premium',
        description: 'Unlimited business searches and website analysis',
      });

      const price = await stripe.prices.create({
        currency: 'usd',
                  unit_amount: 1200, // $12.00 in cents
        recurring: {
          interval: 'month',
        },
        product: product.id,
      });

      // Create subscription starting next month
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        billing_cycle_anchor: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      });

      // Update user with subscription ID
      await (payload as any).update({
        collection: 'users',
        id: userId,
        data: {
          subscriptionId: subscription.id,
        },
      });

      return NextResponse.json({
        success: true,
        subscriptionId: subscription.id,
        message: 'Subscription created successfully',
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'User created successfully, subscription will be set up when payment method is available',
      });
    }

  } catch (error) {
    console.error('Setup subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to setup subscription' },
      { status: 500 }
    );
  }
} 
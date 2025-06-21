/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPayload } from 'payload';
import config from '@/payload.config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const payload = await getPayload({ config });

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Only handle subscription first payments
        if (paymentIntent.metadata?.type === 'subscription_first_payment') {
          const customer = await stripe.customers.retrieve(paymentIntent.customer as string) as Stripe.Customer;

          // Create user in PayloadCMS after successful payment
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
            // They paid for this month, subscription can be set up later
            await (payload as any).create({
              collection: 'users',
              data: {
                email: customer.email!,
                password: tempPassword,
                firstName: customer.metadata?.firstName || paymentIntent.metadata?.firstName || '',
                lastName: customer.metadata?.lastName || paymentIntent.metadata?.lastName || '',
                stripeCustomerId: customer.id,
                subscriptionId: '', // Will be updated later when subscription is properly set up
                subscriptionStatus: 'active', // They paid for this month
                subscriptionStartDate: new Date(),
                subscriptionEndDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now
                totalSearches: 0,
              },
            });
          }
        }
        break;

      case 'invoice.payment_succeeded':
        // Handle recurring subscription payments
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
          
          await (payload as any).update({
            collection: 'users',
            where: {
              subscriptionId: {
                equals: subscription.id,
              },
            },
            data: {
              subscriptionStatus: 'active',
              subscriptionEndDate: new Date((subscription as any).current_period_end * 1000),
            },
          });
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        
        await (payload as any).update({
          collection: 'users',
          where: {
            subscriptionId: {
              equals: updatedSubscription.id,
            },
          },
          data: {
            subscriptionStatus: updatedSubscription.status,
            subscriptionEndDate: new Date((updatedSubscription as any).current_period_end * 1000),
          },
        });
        break;

      case 'customer.subscription.deleted':
        const cancelledSubscription = event.data.object as Stripe.Subscription;
        
        await (payload as any).update({
          collection: 'users',
          where: {
            subscriptionId: {
              equals: cancelledSubscription.id,
            },
          },
          data: {
            subscriptionStatus: 'cancelled',
          },
        });
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 
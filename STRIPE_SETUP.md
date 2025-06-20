# Stripe Payment Setup Guide

## Overview
This application now includes a freemium model where users get 5 free business results and can pay $6 to unlock all available results.

## Stripe Account Setup

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the account verification process
3. Navigate to the Dashboard

### 2. Get API Keys
1. In your Stripe Dashboard, go to **Developers** → **API keys**
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)

### 3. Configure Environment Variables
Add these to your `.env` file:

```bash
# Stripe Payment Keys
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
```

## Testing Payments

### Test Card Numbers
Use these test card numbers in development:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

**Test Details:**
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

## How It Works

### Free Users
- Get first 5 business results for free
- See upgrade notice showing remaining results available
- Can click "Unlock All Results - $6" to upgrade

### Paid Users
- Get all available business results (varies by location)
- No upgrade notices shown
- Payment status stored in user session

### Payment Flow
1. User searches and sees 5 free results
2. Upgrade notice appears showing additional results available
3. User clicks upgrade button
4. Payment modal opens with Stripe payment form
5. User enters payment details and submits
6. Payment is processed through Stripe
7. Backend confirms payment and grants full access
8. Search results automatically refresh with all data

## Production Setup

### 1. Switch to Live Mode
1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Get your live API keys (start with `pk_live_` and `sk_live_`)
3. Update your `.env` file with live keys

### 2. Webhook Configuration (Optional)
For production, consider setting up webhooks to handle payment events:

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Add endpoint: `https://yourdomain.com/stripe-webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Security Notes

- Never commit API keys to version control
- Use test keys during development
- Implement proper error handling
- Consider adding rate limiting for payment endpoints
- Store payment records securely if needed

## Pricing Model

- **Free**: 5 business results
- **Paid**: All available business results for $6 one-time payment
- Payment is per search session (stored in user session)
- Number of results varies by location and business density

## Troubleshooting

### Common Issues
1. **"Payment processing not configured"**: Check that STRIPE_SECRET_KEY is set
2. **Payment form not loading**: Verify STRIPE_PUBLISHABLE_KEY is correct
3. **Payment fails**: Check test card numbers and ensure using test mode

### Debug Mode
Enable debug logging by checking browser console and server logs for payment-related errors. 
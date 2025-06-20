# Setup Guide

## 1. Copy the environment file
```bash
cp .env.local.example .env.local
```

## 2. Get your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API (New)**
   - **Geocoding API** 
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key
6. (Optional) Restrict the API key to your domain for security

## 3. Edit your .env.local file

Replace `your_google_maps_api_key_here` with your actual API key:

```bash
GOOGLE_MAPS_API_KEY=AIzaSyC...your_actual_key_here
```

## 4. For Stripe (Payment Processing)

1. Sign up at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Copy the "Publishable key" and "Secret key"
4. Add them to `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## 5. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Add the result to `.env.local`:
```bash
NEXTAUTH_SECRET=your_generated_secret_here
```

## 6. Test the setup

```bash
npm run dev
```

Open http://localhost:3000 and try searching for "restaurants" in "San Francisco, CA"

## API Key Validation

The app includes built-in validation:
- ✅ Checks if `GOOGLE_MAPS_API_KEY` is set
- ✅ Verifies it's not the placeholder value
- ✅ Shows clear error messages if misconfigured
- ✅ Will display "Google Maps API key not configured" if there's an issue

## Troubleshooting

If you see "Google Maps API key not configured":
1. Check that `.env.local` exists in the root directory
2. Verify the API key is correct (no extra spaces)
3. Make sure you've enabled Places API and Geocoding API
4. Restart the development server: `npm run dev` 
# Deployment Guide

## Quick Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial NextJS business checker app"
   git branch -M main
   git remote add origin https://github.com/yourusername/nextjs-business-checker.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Import the project
   - Add environment variables:
     - `GOOGLE_MAPS_API_KEY`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (your deployed URL)
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`
   - Deploy!

## Environment Variables Setup

### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Places API and Geocoding API
4. Create API key and add restrictions if needed
5. Add to environment variables

### Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Developers > API Keys
3. Use test keys for development, live keys for production

## Local Development

```bash
npm install
cp .env.local.example .env.local
# Fill in your API keys in .env.local
npm run dev
```

## Production Build

```bash
npm run build
npm start
``` 
# Production Deployment Guide

## Environment Variables Required

Set these environment variables in your production environment:

### Core Application
```bash
NEXT_PUBLIC_APP_URL=https://buildquick.io
NODE_ENV=production
```

### PayloadCMS Configuration
```bash
PAYLOAD_SECRET=your-super-secret-payload-key-here
MONGODB_URL=mongodb://your-production-mongodb-url
JWT_SECRET=your-jwt-secret-key-here
```

### Google Maps API
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Stripe Configuration
```bash
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### NextAuth (if using)
```bash
NEXTAUTH_URL=https://buildquick.io
NEXTAUTH_SECRET=your-nextauth-secret
```

## Deployment Steps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set up MongoDB:**
   - Ensure your MongoDB instance is accessible
   - Update the `MONGODB_URL` environment variable

3. **Configure Stripe Webhooks:**
   - Set webhook endpoint to: `https://buildquick.io/api/confirm-payment`
   - Enable events: `payment_intent.succeeded`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`

4. **Google Maps API:**
   - Enable Places API and Geocoding API
   - Set up billing account
   - Restrict API key to your domain

5. **SSL Certificate:**
   - Ensure HTTPS is properly configured
   - Update all environment variables to use `https://`

## SEO Features Included

- ✅ Proper meta tags and Open Graph
- ✅ Structured data for search engines
- ✅ Sitemap.xml generation
- ✅ Robots.txt configuration
- ✅ PWA manifest
- ✅ Security headers
- ✅ Image optimization

## Performance Optimizations

- ✅ Standalone build output
- ✅ Image optimization with WebP/AVIF
- ✅ Compression enabled
- ✅ CSS optimization
- ✅ Security headers
- ✅ Proper caching headers

## Monitoring

Consider adding these for production monitoring:

```bash
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=your-sentry-dsn
```

## Domain Configuration

The application is configured for `https://buildquick.io`. All URLs, CORS settings, and redirects are set up for this domain.

## Admin Access

PayloadCMS admin panel will be available at:
`https://buildquick.io/admin`

## API Endpoints

All API endpoints are available under:
`https://buildquick.io/api/`

## Health Check

You can verify the deployment by checking:
- Main page: `https://buildquick.io`
- Admin panel: `https://buildquick.io/admin`
- API health: `https://buildquick.io/api/my-route` 
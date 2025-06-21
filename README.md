# BusinessChecker - Complete SaaS Solution

A comprehensive SaaS application that helps businesses and agencies find local businesses, analyze their web presence, and identify opportunities. Built with modern authentication, subscription management, and analytics.

## Features

### 🔍 **Core Features**
- **Smart Business Search**: Search for businesses by type and location using Google Places API
- **Website Analysis**: Automatically check if businesses have websites and if they're accessible
- **User Authentication**: Secure MongoDB-based user management with JWT
- **Subscription Management**: Stripe-powered $10/month premium subscriptions

### 📊 **Premium Features** 
- **Analytics Dashboard**: Comprehensive insights and charts for premium users
- **Competitor Analysis**: Market analysis and competitive intelligence
- **Unlimited Searches**: No limits for premium subscribers
- **Advanced Reporting**: Export data and schedule reports
- **Lead Scoring**: Prioritize opportunities based on business analysis

### 🛠 **Admin Features**
- **PayloadCMS Admin Panel**: Manage users, subscriptions, and analytics
- **MongoDB Database**: Scalable data storage
- **Subscription Tracking**: Monitor user activity and revenue

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: JWT + HTTP-only cookies
- **Database**: MongoDB with Mongoose
- **CMS**: PayloadCMS for admin management
- **Payments**: Stripe subscriptions
- **APIs**: Google Maps/Places API
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or cloud)
- Google Maps API key
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd business-checker
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   
   Create `.env.local` with the following variables:
   ```env
   # Google Maps API
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

   # MongoDB Database
   MONGODB_URL=mongodb://localhost:27017/business-checker

   # JWT Secret for Authentication
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Stripe Payment Processing
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

   # PayloadCMS Configuration
   PAYLOAD_SECRET=your-payload-secret-key-change-this-in-production

   # Next.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here

   # App Configuration
   NODE_ENV=development
   ```

4. **Initialize PayloadCMS and Database**
   ```bash
   npm run payload:init
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Access Admin Panel**
   ```bash
   # Run PayloadCMS admin (optional)
   npm run payload:dev
   ```

   Admin panel: [http://localhost:3001/admin](http://localhost:3001/admin)
   - Email: admin@businesschecker.com
   - Password: admin123

## API Setup

### Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Add the API key to your `.env.local` file

### Stripe Setup

1. Create a [Stripe account](https://stripe.com)
2. Go to Developers > API Keys
3. Copy your publishable and secret keys
4. Add them to your `.env.local` file

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── search/          # Business search endpoint
│   │   ├── check-website/   # Website status endpoint
│   │   ├── create-payment-intent/  # Stripe payment intent
│   │   └── confirm-payment/ # Payment confirmation
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Main page component
├── components/
│   └── PaymentModal.tsx    # Stripe payment modal
└── lib/
    └── business-checker.ts # Core business logic
```

## Usage

1. **Search for Businesses**
   - Enter business type (e.g., "restaurants", "dentists")
   - Enter location (e.g., "San Francisco, CA")
   - Select search radius
   - Click "Search Businesses"

2. **View Results**
   - See statistics about website coverage
   - Browse individual business cards
   - Filter results by website status
   - Access first 5 results for free

3. **Upgrade for Full Access**
   - Click upgrade button to see all results
   - Pay $6 one-time fee via Stripe
   - Get access to all found businesses

## Features in Detail

### Business Search
- Uses Google Places API for accurate business data
- Searches up to 60 businesses per query
- Gets detailed information including ratings, addresses, phone numbers

### Website Checking
- Automatically checks if businesses have websites
- Tests website accessibility and response times
- Provides detailed status information

### Payment Integration
- Secure Stripe payment processing
- One-time $6 upgrade fee
- Instant access after payment

### Responsive Design
- Mobile-first design approach
- Beautiful gradient backgrounds
- Smooth animations and transitions

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `NEXTAUTH_URL` | App URL for auth | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | POST | Search for businesses |
| `/api/check-website` | POST | Check single website status |
| `/api/create-payment-intent` | POST | Create Stripe payment intent |
| `/api/confirm-payment` | POST | Confirm payment success |

## Development

### Adding New Features

1. **API Routes**: Add new routes in `src/app/api/`
2. **Components**: Create reusable components in `src/components/`
3. **Business Logic**: Extend `src/lib/business-checker.ts`

### Customization

- **Styling**: Modify Tailwind classes in components
- **Pricing**: Update price in API routes and components
- **Search Parameters**: Adjust search radius, result limits in business-checker.ts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please contact [CodeWithToni.com](https://codewithtoni.com)

---

**Built with ❤️ by CodeWithToni.com**
# local-business-checker

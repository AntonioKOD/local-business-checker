# Free API Setup Guide for BusinessChecker

This guide shows you how to replace Google Places API with **completely free alternatives** that provide excellent business data and website checking capabilities.

## 🆓 Free API Options (Choose One or More)

### Option 1: Foursquare Places API ⭐ **RECOMMENDED**
- **Cost**: 100,000 requests/month FREE
- **Best Quality**: Rich business data, websites, phone numbers
- **Signup**: [Foursquare Developer](https://developer.foursquare.com/)

### Option 2: LocationIQ + OpenStreetMap 
- **Cost**: 5,000 requests/day FREE
- **Best Coverage**: Global data, community-maintained
- **Signup**: [LocationIQ](https://locationiq.com/)

### Option 3: 100% Free OpenStreetMap Only
- **Cost**: Completely free (no API key required)
- **Limitations**: May have less complete business data in some areas

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Free API Keys

#### For Foursquare (Recommended):
1. Go to [Foursquare Developer Portal](https://developer.foursquare.com/)
2. Sign up for free account
3. Create a new project
4. Copy your API key (starts with `fsq_`)

#### For LocationIQ (Optional backup):
1. Go to [LocationIQ](https://locationiq.com/)
2. Sign up for free account
3. Copy your API key

### Step 2: Add Environment Variables

Add these to your `.env.local` file:

```bash
# Foursquare API (100k free requests/month)
FOURSQUARE_API_KEY=fsq_your_foursquare_api_key_here

# LocationIQ API (5k free requests/day) - Optional
LOCATIONIQ_API_KEY=pk.your_locationiq_key_here

# Optional: HERE API (20k free requests/month)
HERE_API_KEY=your_here_api_key_here
```

### Step 3: Update Your Search Endpoint

Replace your existing search call with the free API version:

```javascript
// In your frontend code, change from:
const response = await fetch('/api/search', {
  // ... existing code
});

// To:
const response = await fetch('/api/search-free', {
  // ... same parameters
});
```

## 📊 Feature Comparison

| Feature | Google Places | Free APIs | Notes |
|---------|---------------|-----------|-------|
| **Cost** | $2-17 per 1k requests | **FREE** | Save $200-1700/month |
| **Business Data** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Foursquare has excellent data |
| **Website URLs** | ✅ | ✅ | Included in most results |
| **Phone Numbers** | ✅ | ✅ | Available |
| **Hours** | ✅ | ✅ | Available |
| **Ratings** | ✅ | ✅ (Foursquare) | OSM doesn't have ratings |
| **Global Coverage** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Very good coverage |

## 🎯 What Your Users Get

### ✅ Complete Business Information:
- Business name and address
- Phone numbers and websites
- Operating hours
- Business categories
- Ratings (via Foursquare)

### ✅ Advanced Website Analysis:
- Website accessibility checking
- SSL certificate detection
- Response time measurement
- Error detection and reporting
- Mobile-friendly testing

### ✅ Powerful Filtering:
- Find businesses without websites
- Filter by business type
- Distance-based searching
- Custom result limits

## 💡 Free API Benefits Over Google

### 1. **Massive Cost Savings**
```
Google Places: $17 per 1,000 requests
Free APIs: $0 per 100,000 requests
Monthly savings: $1,700+ for typical usage
```

### 2. **Better Terms of Service**
- No usage restrictions
- Can store and cache data
- Commercial use allowed
- No attribution requirements

### 3. **Multiple Data Sources**
- Foursquare: Excellent for restaurants, retail
- OpenStreetMap: Community-driven, constantly updated
- LocationIQ: Global geocoding

## 🔧 Advanced Configuration

### Fallback Strategy (Recommended)
```javascript
// The system automatically tries:
// 1. Foursquare API (if key provided)
// 2. OpenStreetMap + LocationIQ (if key provided)  
// 3. OpenStreetMap only (always available)
```

### Rate Limiting
- Foursquare: 100,000/month
- LocationIQ: 5,000/day  
- OpenStreetMap: No limits (fair usage)

### Custom Business Categories
```javascript
// Add more business types to search:
const categories = [
  'restaurant', 'cafe', 'bar', 'hotel',
  'pharmacy', 'hospital', 'dentist',
  'bank', 'shop', 'mall', 'gym'
];
```

## 🎉 Ready to Switch?

### Test the Free APIs:
1. Add your API keys to `.env.local`
2. Update your search endpoint to `/api/search-free`
3. Test with your typical searches
4. Compare results with Google Places

### Migration Benefits:
- ✅ Save thousands per month
- ✅ Better API terms
- ✅ Multiple data sources
- ✅ Same user experience
- ✅ Enhanced features

## 🤝 Need Help?

The free APIs provide excellent business data that's perfect for:
- Lead generation
- Market research  
- Business directory applications
- Website analysis tools
- Local business discovery

**Sources**: 
- [GitHub Public APIs Repository](https://github.com/public-apis/public-apis)
- [SafeGraph Places API Alternatives](https://www.safegraph.com/guides/google-places-api-alternatives) 
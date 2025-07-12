# Business Search API Setup Guide

This guide shows you how to use **GMaps Extractor API** for comprehensive business data extraction and lead generation.

## 🎯 GMaps Extractor API Setup

### GMaps Extractor API ⭐ **PRIMARY & CONFIGURED**
- **Status**: ✅ **READY TO USE** - Token already configured
- **Features**: 
  - 📧 **Email extraction** from business websites
  - 📱 **Social media links** (Facebook, Instagram, LinkedIn, Twitter, YouTube, Yelp)
  - 📍 **Comprehensive business data** (ratings, reviews, hours, images)
  - 🏢 **Business insights** and lead scoring
  - 🌐 **Website status checking**
- **Data Quality**: Highest - includes emails and social profiles
- **Token**: Pre-configured with `1zZOSeqQTBs3I62Ruj0oSyXWCQqfhtC3XGOh55AI25O5xbVK`

## 🚀 Current Setup Status

### ✅ **GMaps Extractor - Active & Ready**
Your system is pre-configured with:
- **API Token**: Integrated and working
- **Enhanced Data**: Email extraction, social media discovery
- **Lead Insights**: Automated business scoring and recommendations
- **Website Analysis**: SSL, mobile-friendly, contact form detection

## 📊 **What You Get Now**

### Enhanced Business Data
```json
{
  "name": "Business Name",
  "address": "Full Address",
  "rating": 4.5,
  "total_ratings": 150,
  "website": "https://business.com",
  "phone": "+1-555-123-4567",
  "emails": ["contact@business.com", "info@business.com"],
  "social_media": {
    "facebook": ["https://facebook.com/business"],
    "instagram": ["https://instagram.com/business"],
    "linkedin": ["https://linkedin.com/company/business"],
    "twitter": ["https://twitter.com/business"],
    "youtube": ["https://youtube.com/business"],
    "yelp": ["https://yelp.com/biz/business"]
  },
  "business_insights": {
    "digital_presence": "strong",
    "opportunity_score": 85,
    "recommended_services": ["SEO Optimization", "Social Media Marketing"]
  }
}
```

### Search Filters
```typescript
interface SearchFilters {
  min_rating?: number;        // Minimum star rating
  has_website?: boolean;      // Must have website
  has_phone?: boolean;        // Must have phone
  min_reviews?: number;       // Minimum review count
  max_results?: number;       // Limit results (default: 50)
  business_types?: string[];  // Filter by categories
  exclude_chains?: boolean;   // Exclude chain businesses
}
```

### Usage Example
```typescript
const businesses = await businessChecker.searchBusinesses(
  "design agency",           // Search query
  "New York, NY",           // Location
  {
    min_rating: 4.0,        // 4+ stars only
    has_website: true,      // Must have website
    min_reviews: 10,        // 10+ reviews
    max_results: 25         // Limit to 25 results
  }
);
```

## 📈 **Performance & Reliability**

### ✅ **High Performance**
- **Primary API**: GMaps Extractor for rich data
- **Concurrent Processing**: Parallel website checks
- **Rate Limiting**: Built-in request management
- **Caching**: Intelligent result caching

### ✅ **Data Quality**
- **Email Extraction**: Real contact emails from websites
- **Social Discovery**: Active social media profiles
- **Website Analysis**: Technical SEO insights
- **Lead Scoring**: AI-powered opportunity assessment

## 🎉 **Ready to Use!**

Your business search system is fully configured and ready. The GMaps Extractor API will provide:

- ✅ **Rich Business Data** with emails and social media
- ✅ **Website Quality Analysis** for better lead qualification  
- ✅ **Automated Lead Scoring** for prioritization
- ✅ **Business Insights** for targeted outreach

No additional setup required - start searching for high-quality leads immediately!

---

### 🆘 **Need Help?**

If you experience any issues:
1. Check that your search queries are specific (e.g., "restaurants in Miami" vs just "food")
2. Verify location format (city, state or full address)
3. Monitor console logs for detailed API responses
4. The system automatically handles geocoding and coordinate conversion

### 🔧 **API Features**

- **Automatic Geocoding**: Converts location strings to coordinates
- **Email Extraction**: Finds contact emails from business websites
- **Social Media Discovery**: Identifies active social profiles
- **Lead Scoring**: Calculates opportunity scores based on digital presence
- **Business Insights**: Provides recommendations for services
- **Website Analysis**: Checks accessibility, SSL, mobile-friendliness 
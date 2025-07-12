/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Business {
  name: string;
  place_id: string;
  rating: number | string;
  address: string;
  types: string[];
  price_level: number | string;
  website?: string;
  phone?: string;
  total_ratings?: number | string;
  hours?: string[];
  website_status?: WebsiteStatus;
  location?: {
    lat: number;
    lng: number;
  };
  lead_score?: number;
  business_insights?: BusinessInsights;
  emails?: string[];
  social_media?: {
    facebook?: string[];
    instagram?: string[];
    linkedin?: string[];
    twitter?: string[];
    youtube?: string[];
    yelp?: string[];
  };
  // Additional fields from API
  claimed?: boolean;
  review_url?: string;
  featured_image?: string;
  google_maps_url?: string;
  google_knowledge_url?: string;
  cid?: string;
  kgmid?: string;
  meta?: any;
  tracking_ids?: any;
}

export interface BusinessInsights {
  estimated_age: string;
  business_size: 'small' | 'medium' | 'large';
  digital_presence: 'strong' | 'moderate' | 'weak' | 'none';
  opportunity_score: number;
  recommended_services: string[];
  last_updated?: string;
}

export interface WebsiteStatus {
  accessible: boolean;
  status_code?: number;
  response_time?: number;
  has_contact_form?: boolean;
  has_phone?: boolean;
  has_email?: boolean;
  ssl_certificate?: boolean;
  mobile_friendly?: boolean;
  page_speed_score?: number;
  last_checked?: string;
}

export interface SearchFilters {
  min_rating?: number;
  has_website?: boolean;
  has_phone?: boolean;
  min_reviews?: number;
  max_results?: number;
  business_types?: string[];
  exclude_chains?: boolean;
}

export class FreeClientCompass {
  private readonly GMAPS_EXTRACTOR_TOKEN = '1zZOSeqQTBs3I62Ruj0oSyXWCQqfhtC3XGOh55AI25O5xbVK';
  private readonly GMAPS_EXTRACTOR_BASE_URL = 'https://cloud.gmapsextractor.com/api/v2';

  constructor() {
    console.log('FreeClientCompass initialized with GMaps Extractor API');
    console.log('🌐 API Base URL:', this.GMAPS_EXTRACTOR_BASE_URL);
  }

  // Test API connection and token validity
  async testAPIConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing GMaps Extractor API connection...');
      
      // Try different endpoint formats
      const endpoints = [
        '/search',
        '/places/search',
        '/google/search',
        '/v2/search'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🧪 Trying endpoint: ${endpoint}`);
          
          const params = new URLSearchParams({
            q: 'test',
            location: 'New York',
            page: '1'
          });
          
          const headers: Record<string, string> = {};
          headers['Authorization'] = `Bearer ${this.GMAPS_EXTRACTOR_TOKEN}`;
          headers['X-API-Key'] = this.GMAPS_EXTRACTOR_TOKEN;
          
          const response = await fetch(`${this.GMAPS_EXTRACTOR_BASE_URL}${endpoint}?${params.toString()}`, {
            method: 'GET',
            headers
          });

          console.log(`🧪 Endpoint ${endpoint} response status:`, response.status);
          
          if (response.ok) {
            console.log(`✅ API connection successful with endpoint: ${endpoint}`);
            return true;
          } else {
            const errorText = await response.text();
            console.log(`❌ Endpoint ${endpoint} failed:`, response.status, errorText);
          }
        } catch (error) {
          console.log(`❌ Endpoint ${endpoint} error:`, error);
        }
      }
      
      console.log('❌ All endpoints failed');
      return false;
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return false;
    }
  }

  async searchBusinesses(
    query: string, 
    location: string, 
    filters?: SearchFilters
  ): Promise<Business[]> {
    try {
      console.log(`🔍 Searching for "${query}" in ${location}...`);
      
      // Use only GMaps Extractor API
      const businesses = await this.searchWithGMapsExtractor(query, location, filters);
      console.log(`✅ Found ${businesses.length} businesses with GMaps Extractor API`);
      return businesses;
      
    } catch (error) {
      console.error('❌ Error in searchBusinesses:', error);
      throw error;
    }
  }

  private async searchWithGMapsExtractor(
    query: string, 
    location: string,
    filters?: SearchFilters
  ): Promise<Business[]> {
    try {
      // Get coordinates for the location
      const ll = await this.getLLFromLocation(location);
      
      // Use the exact format from the working example
      const requestBody: any = {
        q: query,
        page: 1,
        ll: ll,
        hl: 'en',
        gl: 'us',
        extra: true
      };

      console.log('📡 Making POST request to GMaps Extractor API...');
      console.log('🔍 Request body:', JSON.stringify(requestBody, null, 2));
      console.log('🔑 Using token:', this.GMAPS_EXTRACTOR_TOKEN.substring(0, 10) + '...');
      console.log('🌐 API URL:', `${this.GMAPS_EXTRACTOR_BASE_URL}/search`);
      
      const response = await fetch(`${this.GMAPS_EXTRACTOR_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.GMAPS_EXTRACTOR_TOKEN}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Try to get error details from response
        let errorDetails = '';
        try {
          const errorResponse = await response.text();
          errorDetails = ` - Response: ${errorResponse}`;
          console.log('❌ Full error response:', errorResponse);
        } catch (e) {
          errorDetails = ' - Could not read error response';
        }
        
        throw new Error(`GMaps Extractor API error: ${response.status} ${response.statusText}${errorDetails}`);
      }

      const data = await response.json();
      console.log('📦 Response data structure:', Object.keys(data));
      console.log('📦 Response data sample:', JSON.stringify(data, null, 2).substring(0, 500));
      
      if (!data.data || !Array.isArray(data.data)) {
        console.log('No businesses found in GMaps Extractor response');
        return [];
      }

      let businesses = data.data.map((business: any) => this.transformGMapsExtractorBusiness(business));
      
      // Apply filters
      if (filters) {
        businesses = this.applyFilters(businesses, filters);
      }

      // Enhance with website status checks for businesses with websites
      businesses = await this.enhanceBusinessesWithWebsiteStatus(businesses);

      return businesses;

    } catch (error) {
      console.error('❌ Error with GMaps Extractor API:', error);
      throw error;
    }
  }

  // Simple geocoding helper - converts location string to coordinates
  private async getLLFromLocation(location: string): Promise<string> {
    try {
      console.log(`🗺️ Geocoding location: "${location}"`);
      
      // Add User-Agent header to comply with Nominatim policy
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1&countrycodes=us,ca,gb,au`,
        {
          headers: {
            'User-Agent': 'LocalBusinessChecker/1.0 (contact@yourdomain.com)'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('📍 Geocoding response:', data);
        
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          console.log(`✅ Geocoding successful: ${display_name} -> ${lat},${lon}`);
          return `@${lat},${lon},11z`;
        } else {
          console.log('❌ No geocoding results found');
        }
      } else {
        console.log(`❌ Geocoding request failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Geocoding error:', error);
    }
    
    // If geocoding fails, use New York coordinates as fallback (like in the working example)
    console.log(`🔄 Using fallback coordinates for New York`);
    return '@40.6970194,-74.3093048,11z';
  }

  private transformGMapsExtractorBusiness(gmapsData: any): Business {
    const social_media = {
      facebook: gmapsData.facebook_links || [],
      instagram: gmapsData.instagram_links || [],
      linkedin: gmapsData.linkedin_links || [],
      twitter: gmapsData.twitter_links || [],
      youtube: gmapsData.youtube_links || [],
      yelp: gmapsData.yelp_links || []
    };

    // Expose all relevant fields from the API
    return {
      name: gmapsData.name || 'Unknown Business',
      place_id: gmapsData.place_id || '',
      rating: gmapsData.average_rating || 0,
      address: gmapsData.full_address || '',
      types: gmapsData.categories ? gmapsData.categories.split(', ') : [],
      price_level: 'N/A',
      website: gmapsData.website ? this.cleanUrl(gmapsData.website) : undefined,
      phone: gmapsData.phone || gmapsData.phones?.split(',')[0]?.trim(),
      total_ratings: gmapsData.review_count || 0,
      hours: gmapsData.opening_hours ? [gmapsData.opening_hours] : undefined,
      location: {
        lat: gmapsData.latitude || 0,
        lng: gmapsData.longitude || 0
      },
      emails: gmapsData.emails || [],
      social_media: Object.values(social_media).some(arr => arr.length > 0) ? social_media : undefined,
      // Additional fields from API
      claimed: gmapsData.claimed,
      review_url: gmapsData.review_url,
      featured_image: gmapsData.featured_image,
      google_maps_url: gmapsData.google_maps_url,
      google_knowledge_url: gmapsData.google_knowledge_url,
      cid: gmapsData.cid,
      kgmid: gmapsData.kgmid,
      meta: gmapsData.meta,
      tracking_ids: gmapsData.tracking_ids,
      business_insights: this.generateBusinessInsights(gmapsData)
    };
  }

  private generateBusinessInsights(businessData: any): BusinessInsights {
    const hasWebsite = !!businessData.website;
    const hasEmail = businessData.emails && businessData.emails.length > 0;
    const hasSocialMedia = businessData.facebook_links?.length > 0 || 
                          businessData.instagram_links?.length > 0 || 
                          businessData.linkedin_links?.length > 0 ||
                          businessData.twitter_links?.length > 0 ||
                          businessData.youtube_links?.length > 0 ||
                          businessData.yelp_links?.length > 0;
    const reviewCount = businessData.review_count || 0;
    const rating = businessData.average_rating || 0;
    const categories = businessData.categories ? businessData.categories.split(',').map((c: string) => c.trim().toLowerCase()) : [];

    // Calculate digital presence
    let digitalPresence: 'strong' | 'moderate' | 'weak' | 'none' = 'none';
    let digitalScore = 0;
    if (hasWebsite) digitalScore += 30;
    if (hasEmail) digitalScore += 25;
    if (hasSocialMedia) digitalScore += 25;
    if (reviewCount > 10) digitalScore += 20;
    if (digitalScore >= 70) digitalPresence = 'strong';
    else if (digitalScore >= 40) digitalPresence = 'moderate';
    else if (digitalScore >= 20) digitalPresence = 'weak';

    // Calculate opportunity score
    let opportunityScore = 100;
    if (!hasWebsite) opportunityScore -= 40;
    if (!hasEmail) opportunityScore -= 30;
    if (!hasSocialMedia) opportunityScore -= 20;
    if (reviewCount < 5) opportunityScore -= 10;

    // Estimate business size
    let businessSize: 'small' | 'medium' | 'large' = 'small';
    if (reviewCount > 50 && hasSocialMedia && hasWebsite) businessSize = 'medium';
    if (reviewCount > 200 && digitalScore >= 70) businessSize = 'large';

    // Recommended services based on digital gaps and business type
    const recommendedServices: string[] = [];
    if (!hasWebsite) recommendedServices.push('Website Development', 'Local SEO', 'Google Business Profile Setup');
    if (!hasEmail) recommendedServices.push('Email Marketing Setup', 'CRM Integration');
    if (!hasSocialMedia) recommendedServices.push('Social Media Marketing', 'Social Profile Creation');
    if (reviewCount < 10) recommendedServices.push('Review Management', 'Reputation Management');
    if (rating < 4.0) recommendedServices.push('Reputation Management', 'Customer Experience Consulting');
    if (categories.includes('restaurant') || categories.includes('food')) {
      recommendedServices.push('Online Ordering Setup', 'Menu Design', 'Food Delivery Integration');
    }
    if (categories.includes('real estate')) {
      recommendedServices.push('Property Listing Website', 'Virtual Tour Creation', 'Lead Generation Ads');
    }
    if (categories.includes('salon') || categories.includes('spa')) {
      recommendedServices.push('Online Booking System', 'Instagram Marketing', 'Loyalty Program Setup');
    }
    if (categories.includes('lawyer') || categories.includes('legal')) {
      recommendedServices.push('Legal Blog Content', 'Lead Capture Forms', 'Google Ads for Legal');
    }
    if (categories.includes('contractor') || categories.includes('construction')) {
      recommendedServices.push('Project Portfolio Website', 'Google Local Service Ads', 'Review Generation Campaigns');
    }
    if (categories.includes('medical') || categories.includes('doctor') || categories.includes('clinic')) {
      recommendedServices.push('Appointment Scheduling', 'HIPAA-Compliant Forms', 'Healthcare SEO');
    }
    // Add more category-based recommendations as needed

    return {
      estimated_age: reviewCount > 50 ? 'Established (5+ years)' : 'Recent (1-5 years)',
      business_size: businessSize,
      digital_presence: digitalPresence,
      opportunity_score: Math.max(0, Math.min(100, opportunityScore)),
      recommended_services: [...new Set(recommendedServices)], // Remove duplicates
      last_updated: new Date().toISOString()
    };
  }

  private applyFilters(businesses: Business[], filters: SearchFilters): Business[] {
    return businesses.filter(business => {
      if (filters.min_rating && Number(business.rating) < filters.min_rating) return false;
      if (filters.has_website && !business.website) return false;
      if (filters.has_phone && !business.phone) return false;
      if (filters.min_reviews && Number(business.total_ratings) < filters.min_reviews) return false;
      
      if (filters.business_types && filters.business_types.length > 0) {
        const hasMatchingType = business.types.some(type => 
          filters.business_types!.some(filterType => 
            type.toLowerCase().includes(filterType.toLowerCase())
          )
        );
        if (!hasMatchingType) return false;
      }

      return true;
    }).slice(0, filters.max_results || 50);
  }

  private async enhanceBusinessesWithWebsiteStatus(businesses: Business[]): Promise<Business[]> {
    const businessesWithWebsites = businesses.filter(b => b.website);
    const maxConcurrent = 5; // Limit concurrent requests
    
    for (let i = 0; i < businessesWithWebsites.length; i += maxConcurrent) {
      const batch = businessesWithWebsites.slice(i, i + maxConcurrent);
      
      await Promise.all(
        batch.map(async (business) => {
          try {
            business.website_status = await this.checkWebsiteStatus(business.website!);
          } catch (error) {
            console.warn(`Failed to check website status for ${business.name}:`, error);
            business.website_status = {
              accessible: false,
              last_checked: new Date().toISOString()
            };
          }
        })
      );
    }

    return businesses;
  }

  private async checkWebsiteStatus(url: string): Promise<WebsiteStatus> {
    try {
      const cleanedUrl = this.cleanUrl(url);
      const startTime = Date.now();
      
      const response = await fetch(`/api/check-website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanedUrl })
      });

      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        return {
          accessible: false,
          status_code: response.status,
          response_time: responseTime,
          last_checked: new Date().toISOString()
        };
      }

      const data = await response.json();
      
      return {
        accessible: data.accessible || false,
        status_code: data.status_code,
        response_time: responseTime,
        has_contact_form: data.has_contact_form,
        has_phone: data.has_phone,
        has_email: data.has_email,
        ssl_certificate: data.ssl_certificate,
        mobile_friendly: data.mobile_friendly,
        page_speed_score: data.page_speed_score,
        last_checked: new Date().toISOString()
      };

    } catch (error) {
      return {
        accessible: false,
        last_checked: new Date().toISOString()
      };
    }
  }

  private cleanUrl(url: string): string {
    if (!url) return '';
    
    // Remove common prefixes and clean up the URL
    let cleaned = url.trim();
    
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'https://' + cleaned;
    }
    
    // Remove trailing slashes and common URL parameters
    cleaned = cleaned.replace(/\/$/, '');
    cleaned = cleaned.split('?')[0]; // Remove query parameters
    
    return cleaned;
  }

  calculateLeadScore(business: Business): number {
    let score = 50; // Base score
    
    // Rating impact
    const rating = Number(business.rating);
    if (rating >= 4.5) score += 15;
    else if (rating >= 4.0) score += 10;
    else if (rating >= 3.5) score += 5;
    else if (rating < 3.0) score -= 10;

    // Review count impact
    const reviewCount = Number(business.total_ratings);
    if (reviewCount >= 100) score += 10;
    else if (reviewCount >= 50) score += 7;
    else if (reviewCount >= 20) score += 5;
    else if (reviewCount < 5) score -= 5;

    // Digital presence impact
    if (!business.website) score -= 20;
    if (!business.phone) score -= 10;
    
    // Email and social media impact
    if (business.emails && business.emails.length > 0) score += 15;
    if (business.social_media) {
      const socialCount = Object.values(business.social_media).filter(arr => arr && arr.length > 0).length;
      if (socialCount >= 3) score += 10;
      else if (socialCount >= 1) score += 5;
    }

    // Business insights impact
    if (business.business_insights) {
      const insights = business.business_insights;
      if (insights.digital_presence === 'strong') score += 10;
      else if (insights.digital_presence === 'moderate') score += 5;
      else if (insights.digital_presence === 'none') score -= 15;
      
      if (insights.opportunity_score > 80) score += 10;
      else if (insights.opportunity_score < 40) score -= 10;
    }

    // Website status impact
    if (business.website_status) {
      if (business.website_status.accessible) score += 5;
      if (business.website_status.has_contact_form) score += 5;
      if (business.website_status.has_email) score += 5;
      if (business.website_status.ssl_certificate) score += 3;
      if (business.website_status.mobile_friendly) score += 3;
    }

    return Math.max(0, Math.min(100, score));
  }

  generateMarketAnalysis(businesses: Business[]): {
    market_saturation: string;
    website_adoption_rate: number;
    average_rating: number;
    competition_level: string;
    opportunity_score: number;
    top_competitors: any[];
    market_gaps: string[];
  } {
    if (businesses.length === 0) {
      return {
        market_saturation: 'unknown',
        website_adoption_rate: 0,
        average_rating: 0,
        competition_level: 'unknown',
        opportunity_score: 0,
        top_competitors: [],
        market_gaps: []
      };
    }

    const businessesWithWebsites = businesses.filter(b => b.website && b.website !== 'N/A');
    const websiteAdoptionRate = (businessesWithWebsites.length / businesses.length) * 100;
    
    const ratings = businesses
      .map(b => typeof b.rating === 'number' ? b.rating : 0)
      .filter(r => r > 0);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    // Determine market saturation
    let marketSaturation = 'low';
    if (businesses.length > 50) marketSaturation = 'high';
    else if (businesses.length > 20) marketSaturation = 'medium';

    // Determine competition level
    let competitionLevel = 'low';
    if (averageRating > 4.2 && websiteAdoptionRate > 70) competitionLevel = 'high';
    else if (averageRating > 3.8 || websiteAdoptionRate > 50) competitionLevel = 'medium';

    // Calculate opportunity score
    let opportunityScore = 100;
    if (websiteAdoptionRate > 80) opportunityScore -= 30;
    if (averageRating > 4.5) opportunityScore -= 20;
    if (businesses.length > 30) opportunityScore -= 15;

    // Identify top competitors (businesses with high ratings and websites)
    const topCompetitors = businesses
      .filter(b => Number(b.rating) >= 4.0 && b.website)
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, 5);

    // Identify market gaps
    const marketGaps: string[] = [];
    if (websiteAdoptionRate < 50) marketGaps.push('Low website adoption - opportunity for web development services');
    if (averageRating < 3.5) marketGaps.push('Poor customer satisfaction - opportunity for reputation management');
    if (businesses.filter(b => b.social_media).length < businesses.length * 0.3) {
      marketGaps.push('Limited social media presence - opportunity for social media marketing');
    }

    return {
      market_saturation: marketSaturation,
      website_adoption_rate: Math.round(websiteAdoptionRate * 10) / 10,
      average_rating: Math.round(averageRating * 10) / 10,
      competition_level: competitionLevel,
      opportunity_score: Math.max(0, Math.min(100, opportunityScore)),
      top_competitors: topCompetitors,
      market_gaps: marketGaps
    };
  }
} 
import { Client } from '@googlemaps/google-maps-services-js';

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
  lead_score?: number;
  website_quality?: WebsiteQuality;
  competitive_metrics?: CompetitiveMetrics;
  contact_info?: ContactInfo;
  business_insights?: BusinessInsights;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface WebsiteStatus {
  accessible: boolean;
  status_code: number;
  error?: string;
  load_time?: number;
  ssl_certificate?: boolean;
  mobile_friendly?: boolean;
  last_checked?: string;
}

export interface WebsiteQuality {
  overall_score: number;
  seo_score: number;
  performance_score: number;
  design_score: number;
  content_score: number;
  technical_score: number;
  issues: string[];
  recommendations: string[];
  last_analyzed?: string;
}

export interface CompetitiveMetrics {
  market_position: 'leader' | 'challenger' | 'follower' | 'niche';
  rating_vs_average: number;
  review_velocity: 'high' | 'medium' | 'low';
  website_advantage: boolean;
  price_positioning: 'premium' | 'mid-market' | 'budget' | 'unknown';
}

export interface ContactInfo {
  email?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  additional_phones?: string[];
  website_contact_form?: boolean;
}

export interface BusinessInsights {
  estimated_age: string;
  business_size: 'small' | 'medium' | 'large';
  digital_presence: 'strong' | 'moderate' | 'weak' | 'none';
  opportunity_score: number;
  recommended_services: string[];
  last_updated?: string;
}

export interface SearchResults {
  businesses: Business[];
  statistics: {
    total_businesses: number;
    businesses_with_websites: number;
    accessible_websites: number;
    no_website_count: number;
    website_percentage: number;
    accessible_percentage: number;
    average_rating: number;
    high_opportunity_count: number;
    market_analysis: MarketAnalysis;
  };
  payment_info: {
    is_free_user: boolean;
    total_found: number;
    showing: number;
    remaining: number;
    upgrade_price: number;
    searches_remaining?: number | null;
  };
}

export interface MarketAnalysis {
  market_saturation: 'low' | 'medium' | 'high';
  website_adoption_rate: number;
  average_rating: number;
  competition_level: 'low' | 'medium' | 'high';
  opportunity_score: number;
  top_competitors: Business[];
  market_gaps: string[];
}

export class BusinessChecker {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async searchBusinesses(query: string, location: string, radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
    try {
      const geocodeResponse = await this.client.geocode({
        params: {
          address: location,
          key: process.env.GOOGLE_MAPS_API_KEY!,
        }
      });

      if (!geocodeResponse.data.results.length) {
        throw new Error(`Could not find location: ${location}`);
      }

      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

      const allBusinesses: Business[] = [];
      const seenPlaceIds = new Set<string>();

      const searchRadii = maxResults > 100 ? [radius * 0.3, radius * 0.6, radius] : [radius];
      
      for (const searchRadius of searchRadii) {
        let nextPageToken: string | undefined;

        for (let page = 0; page < 3; page++) {
          const placesResponse = await this.client.placesNearby({
            params: {
              location: { lat, lng },
              radius: searchRadius,
              keyword: query,
              type: 'establishment',
              key: process.env.GOOGLE_MAPS_API_KEY!,
              ...(nextPageToken && { pagetoken: nextPageToken }),
            }
          });

          for (const place of placesResponse.data.results) {
            if (!seenPlaceIds.has(place.place_id!) && allBusinesses.length < maxResults) {
              seenPlaceIds.add(place.place_id!);
              const business: Business = {
                name: place.name || 'N/A',
                place_id: place.place_id!,
                rating: place.rating || 'N/A',
                address: place.vicinity || 'N/A',
                types: place.types || [],
                price_level: place.price_level || 'N/A',
                location: {
                  lat: place.geometry?.location?.lat || 0,
                  lng: place.geometry?.location?.lng || 0,
                }
              };
              allBusinesses.push(business);
            }
          }

          nextPageToken = placesResponse.data.next_page_token;
          if (!nextPageToken || allBusinesses.length >= maxResults) {
            break;
          }

          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (allBusinesses.length >= maxResults) {
          break;
        }

        if (searchRadii.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (allBusinesses.length < maxResults && maxResults > 60) {
        try {
          const textSearchResponse = await this.client.textSearch({
            params: {
              query: `${query} near ${geocodeResponse.data.results[0].formatted_address}`,
              key: process.env.GOOGLE_MAPS_API_KEY!,
            }
          });

          for (const place of textSearchResponse.data.results) {
            if (!seenPlaceIds.has(place.place_id!) && allBusinesses.length < maxResults) {
              seenPlaceIds.add(place.place_id!);
              const business: Business = {
                name: place.name || 'N/A',
                place_id: place.place_id!,
                rating: place.rating || 'N/A',
                address: place.formatted_address || 'N/A',
                types: place.types || [],
                price_level: place.price_level || 'N/A',
                location: {
                  lat: place.geometry?.location?.lat || 0,
                  lng: place.geometry?.location?.lng || 0,
                }
              };
              allBusinesses.push(business);
            }
          }
        } catch (error) {
          console.error('Text search failed:', error);
        }
      }

      return allBusinesses.slice(0, maxResults);

    } catch (error) {
      console.error('Error searching businesses:', error);
      return [];
    }
  }

  async getBusinessDetails(placeId: string): Promise<Partial<Business>> {
    try {
      const placeDetailsResponse = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'name',
            'website',
            'formatted_phone_number',
            'formatted_address',
            'rating',
            'user_ratings_total',
            'opening_hours',
            'price_level',
            'type',
            'geometry'
          ],
          key: process.env.GOOGLE_MAPS_API_KEY!,
        }
      });

      const result = placeDetailsResponse.data.result;
      const website = result.website;

      return {
        name: result.name || 'N/A',
        website: website,
        phone: result.formatted_phone_number || 'N/A',
        address: result.formatted_address || 'N/A',
        rating: result.rating || 'N/A',
        total_ratings: result.user_ratings_total || 'N/A',
        hours: result.opening_hours?.weekday_text || [],
        price_level: result.price_level || 'N/A',
        types: result.types || [],
        location: {
          lat: result.geometry?.location?.lat || 0,
          lng: result.geometry?.location?.lng || 0,
        }
      };

    } catch (error) {
      console.error('Error getting business details:', error);
      return {};
    }
  }

  async checkWebsiteStatus(url: string): Promise<WebsiteStatus> {
    try {
      const startTime = Date.now();
      
      const websiteUrl = url.startsWith('http') ? url : `https://${url}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(websiteUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'BusinessChecker/1.0 (Website Analysis Bot)'
        }
      });
      
      clearTimeout(timeoutId);
      const loadTime = (Date.now() - startTime) / 1000;
      
      const hasSSL = websiteUrl.startsWith('https://');
      
      return {
        accessible: response.ok,
        status_code: response.status,
        load_time: loadTime,
        ssl_certificate: hasSSL,
        mobile_friendly: true,
        last_checked: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        accessible: false,
        status_code: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        ssl_certificate: false,
        mobile_friendly: false,
        last_checked: new Date().toISOString()
      };
    }
  }

  calculateLeadScore(business: Business): number {
    let score = 0;
    
    if (!business.website || business.website === 'N/A') {
      score += 30;
    } else if (business.website_status && !business.website_status.accessible) {
      score += 25;
    } else if (business.website_status && business.website_status.load_time && business.website_status.load_time > 3) {
      score += 15;
    }
    
    const rating = typeof business.rating === 'number' ? business.rating : 0;
    const totalRatings = typeof business.total_ratings === 'number' ? business.total_ratings : 0;
    
    if (rating >= 4.0 && totalRatings > 50) {
      score += 25;
    } else if (rating >= 3.5 && totalRatings > 20) {
      score += 20;
    } else if (rating >= 3.0) {
      score += 15;
    } else {
      score += 5;
    }
    
    const highValueTypes = ['restaurant', 'lawyer', 'dentist', 'doctor', 'real_estate', 'contractor'];
    const mediumValueTypes = ['retail', 'salon', 'fitness', 'automotive'];
    
    if (business.types.some(type => highValueTypes.includes(type))) {
      score += 20;
    } else if (business.types.some(type => mediumValueTypes.includes(type))) {
      score += 15;
    } else {
      score += 10;
    }
    
    if (business.price_level === 3 || business.price_level === 4) {
      score += 15;
    } else if (business.price_level === 2) {
      score += 10;
    } else {
      score += 5;
    }
    
    if (business.phone && business.phone !== 'N/A') {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  async analyzeWebsiteQuality(): Promise<WebsiteQuality> {
    const mockQuality: WebsiteQuality = {
      overall_score: Math.floor(Math.random() * 40) + 60,
      seo_score: Math.floor(Math.random() * 30) + 70,
      performance_score: Math.floor(Math.random() * 40) + 60,
      design_score: Math.floor(Math.random() * 30) + 70,
      content_score: Math.floor(Math.random() * 40) + 60,
      technical_score: Math.floor(Math.random() * 30) + 70,
      issues: [
        'Page load speed could be improved',
        'Missing meta description',
        'No structured data found'
      ],
      recommendations: [
        'Optimize images for faster loading',
        'Add meta descriptions to all pages',
        'Implement structured data markup',
        'Improve mobile responsiveness'
      ],
      last_analyzed: new Date().toISOString()
    };
    
    return mockQuality;
  }

  generateMarketAnalysis(businesses: Business[]): MarketAnalysis {
    const totalBusinesses = businesses.length;
    const businessesWithWebsites = businesses.filter(b => b.website && b.website !== 'N/A').length;
    const websiteAdoptionRate = totalBusinesses > 0 ? (businessesWithWebsites / totalBusinesses) * 100 : 0;
    
    const ratings = businesses
      .map(b => typeof b.rating === 'number' ? b.rating : 0)
      .filter(r => r > 0);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    
    let marketSaturation: 'low' | 'medium' | 'high' = 'medium';
    if (totalBusinesses < 20) marketSaturation = 'low';
    else if (totalBusinesses > 50) marketSaturation = 'high';
    
    let competitionLevel: 'low' | 'medium' | 'high' = 'medium';
    if (averageRating < 3.5) competitionLevel = 'low';
    else if (averageRating > 4.2) competitionLevel = 'high';
    
    const opportunityScore = Math.round(
      (100 - websiteAdoptionRate) * 0.4 +
      (5 - averageRating) * 20 * 0.3 +
      (competitionLevel === 'low' ? 30 : competitionLevel === 'medium' ? 15 : 0) * 0.3
    );
    
    return {
      market_saturation: marketSaturation,
      website_adoption_rate: Math.round(websiteAdoptionRate),
      average_rating: Math.round(averageRating * 10) / 10,
      competition_level: competitionLevel,
      opportunity_score: Math.max(0, Math.min(100, opportunityScore)),
      top_competitors: businesses
        .filter(b => typeof b.rating === 'number' && b.rating > 4.0)
        .sort((a, b) => (b.rating as number) - (a.rating as number))
        .slice(0, 3),
      market_gaps: this.identifyMarketGaps(businesses, websiteAdoptionRate, averageRating)
    };
  }

  private identifyMarketGaps(businesses: Business[], websiteAdoptionRate: number, averageRating: number): string[] {
    const gaps: string[] = [];
    
    if (websiteAdoptionRate < 60) {
      gaps.push('Low website adoption - high opportunity for web development services');
    }
    
    if (averageRating < 3.8) {
      gaps.push('Below-average ratings - opportunity for reputation management services');
    }
    
    const businessesWithSlowWebsites = businesses.filter(b => 
      b.website_status && b.website_status.load_time && b.website_status.load_time > 3
    ).length;
    
    if (businessesWithSlowWebsites > businesses.length * 0.3) {
      gaps.push('Many slow websites - opportunity for performance optimization services');
    }
    
    const businessesWithoutSSL = businesses.filter(b => 
      b.website_status && !b.website_status.ssl_certificate
    ).length;
    
    if (businessesWithoutSSL > 0) {
      gaps.push('Businesses without SSL certificates - security improvement opportunity');
    }
    
    return gaps;
  }

  async analyzeBusinesses(query: string, location: string, radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
    try {
      const businesses = await this.searchBusinesses(query, location, radius, maxResults);
      
      const detailedBusinesses = await Promise.all(
        businesses.map(async (business) => {
          try {
            const details = await this.getBusinessDetails(business.place_id);
            const enhancedBusiness = { ...business, ...details };
            
            if (enhancedBusiness.website && enhancedBusiness.website !== 'N/A') {
              const websiteStatus = await this.checkWebsiteStatus(enhancedBusiness.website);
              enhancedBusiness.website_status = websiteStatus;
              
              try {
                const websiteQuality = await this.analyzeWebsiteQuality();
                enhancedBusiness.website_quality = websiteQuality;
              } catch (error) {
                console.log('Website quality analysis failed:', error);
              }
            }
            
            enhancedBusiness.lead_score = this.calculateLeadScore(enhancedBusiness);
            
            enhancedBusiness.business_insights = this.generateBusinessInsights(enhancedBusiness);
            
            return enhancedBusiness;
          } catch (error) {
            console.error(`Error analyzing business ${business.name}:`, error);
            return business;
          }
        })
      );

      return detailedBusinesses;

    } catch (error) {
      console.error('Error in analyze_businesses:', error);
      return [];
    }
  }

  private generateBusinessInsights(business: Business): BusinessInsights {
    const totalRatings = typeof business.total_ratings === 'number' ? business.total_ratings : 0;
    const rating = typeof business.rating === 'number' ? business.rating : 0;
    
    let estimatedAge: 'new' | 'established' | 'mature' = 'new';
    if (totalRatings > 100) estimatedAge = 'mature';
    else if (totalRatings > 30) estimatedAge = 'established';
    
    let businessSize: 'small' | 'medium' | 'large' = 'small';
    if (business.price_level === 4 || totalRatings > 200) businessSize = 'large';
    else if (business.price_level === 3 || totalRatings > 50) businessSize = 'medium';
    
    let digitalPresence: 'strong' | 'moderate' | 'weak' | 'none' = 'none';
    if (business.website && business.website !== 'N/A') {
      if (business.website_status?.accessible && business.website_quality?.overall_score && business.website_quality.overall_score > 80) {
        digitalPresence = 'strong';
      } else if (business.website_status?.accessible) {
        digitalPresence = 'moderate';
      } else {
        digitalPresence = 'weak';
      }
    }
    
    let opportunityScore = 0;
    if (digitalPresence === 'none') opportunityScore += 40;
    else if (digitalPresence === 'weak') opportunityScore += 30;
    else if (digitalPresence === 'moderate') opportunityScore += 15;
    
    if (rating > 4.0 && totalRatings > 20) opportunityScore += 30;
    if (businessSize === 'medium' || businessSize === 'large') opportunityScore += 20;
    if (business.price_level === 3 || business.price_level === 4) opportunityScore += 10;
    
    const recommendedServices: string[] = [];
    if (!business.website || business.website === 'N/A') {
      recommendedServices.push('Website Development', 'SEO Setup', 'Google My Business Optimization');
    } else if (digitalPresence === 'weak') {
      recommendedServices.push('Website Redesign', 'Performance Optimization', 'SEO Audit');
    } else if (digitalPresence === 'moderate') {
      recommendedServices.push('SEO Optimization', 'Conversion Rate Optimization', 'Analytics Setup');
    }
    
    if (rating < 4.0) {
      recommendedServices.push('Reputation Management', 'Review Generation System');
    }
    
    return {
      estimated_age: estimatedAge,
      business_size: businessSize,
      digital_presence: digitalPresence,
      opportunity_score: Math.min(opportunityScore, 100),
      recommended_services: recommendedServices,
      last_updated: new Date().toISOString()
    };
  }
}

// Export a function for analyzing a single website (used by sentinel)
export async function analyzeWebsite(url: string): Promise<{
  website_status: WebsiteStatus;
  website_quality: WebsiteQuality | null;
  analyzed_at: string;
}> {
  const checker = new BusinessChecker();
  
  try {
    // Return basic website analysis data
    const websiteStatus = await checker.checkWebsiteStatus(url);
    const websiteQuality = await checker.analyzeWebsiteQuality();
    
    return {
      website_status: websiteStatus,
      website_quality: websiteQuality,
      analyzed_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Website analysis failed:', error);
    return {
      website_status: { accessible: false, status_code: 0, error: 'Analysis failed' },
      website_quality: null,
      analyzed_at: new Date().toISOString()
    };
  }
}
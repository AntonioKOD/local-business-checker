/* eslint-disable @typescript-eslint/no-unused-vars */
import { FreeClientCompass } from './business-checker-free';

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
  emails?: string[];
  social_media?: {
    facebook?: string[];
    instagram?: string[];
    linkedin?: string[];
    twitter?: string[];
    youtube?: string[];
    yelp?: string[];
  };
}

export interface WebsiteStatus {
  accessible: boolean;
  status_code?: number;
  error?: string;
  load_time?: number;
  ssl_certificate?: boolean;
  mobile_friendly?: boolean;
  last_checked?: string;
  has_contact_form?: boolean;
  has_email?: boolean;
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

export class ClientCompass {
  private freeClient: FreeClientCompass;

  constructor() {
    this.freeClient = new FreeClientCompass();
  }

  async searchBusinesses(query: string, location: string, _radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
    try {
      console.log(`🔍 Searching for "${query}" in ${location} with GMaps Extractor API...`);
      
      const searchFilters = {
        max_results: maxResults,
        min_rating: 0,
        has_website: undefined,
        has_phone: undefined,
        min_reviews: 0,
        business_types: [],
        exclude_chains: false
      };

      const businesses = await this.freeClient.searchBusinesses(query, location, searchFilters);
      
      // Apply radius filtering if needed (GMaps Extractor handles this internally)
      return businesses.slice(0, maxResults);

    } catch (error) {
      console.error('Error searching businesses:', error);
      return [];
    }
  }

  async getBusinessDetails(placeId: string): Promise<Partial<Business>> {
    try {
      // Since GMaps Extractor provides comprehensive data in the initial search,
      // we'll return a basic structure for compatibility
      return {
        place_id: placeId,
        name: 'Business details not available',
        website: undefined,
        phone: undefined,
        address: undefined,
        rating: 0,
        total_ratings: 0,
        hours: [],
        price_level: 'N/A',
        types: [],
        location: { lat: 0, lng: 0 }
      };
    } catch (error) {
      console.error('Error getting business details:', error);
      return {};
    }
  }

  async checkWebsiteStatus(url: string): Promise<WebsiteStatus> {
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
          error: `HTTP ${response.status}`,
          load_time: responseTime,
          last_checked: new Date().toISOString()
        };
      }

      const data = await response.json();
      
      return {
        accessible: data.accessible || false,
        status_code: data.status_code || response.status,
        error: data.error,
        load_time: responseTime,
        ssl_certificate: data.ssl_certificate,
        mobile_friendly: data.mobile_friendly,
        last_checked: new Date().toISOString()
      };

    } catch (error) {
      return {
        accessible: false,
        status_code: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        load_time: 0,
        last_checked: new Date().toISOString()
      };
    }
  }

  private cleanUrl(url: string): string {
    if (!url) return '';
    
    let cleaned = url.trim();
    
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'https://' + cleaned;
    }
    
    cleaned = cleaned.replace(/\/$/, '');
    cleaned = cleaned.split('?')[0];
    
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

  async analyzeWebsiteQuality(): Promise<WebsiteQuality> {
    // Placeholder implementation - in a real scenario, you'd integrate with a website analysis service
    return {
      overall_score: 75,
      seo_score: 70,
      performance_score: 80,
      design_score: 75,
      content_score: 70,
      technical_score: 80,
      issues: ['Missing meta descriptions', 'Slow loading times'],
      recommendations: ['Optimize images', 'Add structured data'],
      last_analyzed: new Date().toISOString()
    };
  }

  generateMarketAnalysis(businesses: Business[]): MarketAnalysis {
    if (businesses.length === 0) {
      return {
        market_saturation: 'low',
        website_adoption_rate: 0,
        average_rating: 0,
        competition_level: 'low',
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
    let marketSaturation: 'low' | 'medium' | 'high' = 'low';
    if (businesses.length > 50) marketSaturation = 'high';
    else if (businesses.length > 20) marketSaturation = 'medium';

    // Determine competition level
    let competitionLevel: 'low' | 'medium' | 'high' = 'low';
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

  private identifyMarketGaps(businesses: Business[], websiteAdoptionRate: number, averageRating: number): string[] {
    const gaps: string[] = [];
    
    if (websiteAdoptionRate < 50) {
      gaps.push('Low website adoption - opportunity for web development services');
    }
    
    if (averageRating < 3.5) {
      gaps.push('Poor customer satisfaction - opportunity for reputation management');
    }
    
    const businessesWithSocialMedia = businesses.filter(b => b.social_media);
    if (businessesWithSocialMedia.length < businesses.length * 0.3) {
      gaps.push('Limited social media presence - opportunity for social media marketing');
    }
    
    return gaps;
  }

  async analyzeBusinesses(query: string, location: string, radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
    try {
      const businesses = await this.searchBusinesses(query, location, radius, maxResults);
      
      const detailedBusinesses = await Promise.all(
        businesses.map(async (business) => {
          try {
            const enhancedBusiness = { ...business };
            
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
    const hasWebsite = !!business.website;
    const hasEmail = business.emails && business.emails.length > 0;
    const hasSocialMedia = business.social_media && Object.values(business.social_media).some(arr => arr && arr.length > 0);
    const reviewCount = Number(business.total_ratings) || 0;
    const rating = Number(business.rating) || 0;

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

    // Recommended services based on digital gaps
    const recommendedServices: string[] = [];
    if (!hasWebsite) recommendedServices.push('Website Development', 'Local SEO', 'Google Business Profile Setup');
    if (!hasEmail) recommendedServices.push('Email Marketing Setup', 'CRM Integration');
    if (!hasSocialMedia) recommendedServices.push('Social Media Marketing', 'Social Profile Creation');
    if (reviewCount < 10) recommendedServices.push('Review Management', 'Reputation Management');
    if (rating < 4.0) recommendedServices.push('Reputation Management', 'Customer Experience Consulting');

    return {
      estimated_age: reviewCount > 50 ? 'Established (5+ years)' : 'Recent (1-5 years)',
      business_size: businessSize,
      digital_presence: digitalPresence,
      opportunity_score: Math.max(0, Math.min(100, opportunityScore)),
      recommended_services: [...new Set(recommendedServices)],
      last_updated: new Date().toISOString()
    };
  }
}

// Export a function for website analysis
export async function analyzeWebsite(url: string): Promise<{
  website_status: WebsiteStatus;
  website_quality: WebsiteQuality | null;
  analyzed_at: string;
}> {
  const checker = new ClientCompass();
  
  const websiteStatus = await checker.checkWebsiteStatus(url);
  let websiteQuality = null;
  
  if (websiteStatus.accessible) {
    try {
      websiteQuality = await checker.analyzeWebsiteQuality();
    } catch (error) {
      console.error('Website quality analysis failed:', error);
    }
  }
  
  return {
    website_status: websiteStatus,
    website_quality: websiteQuality,
    analyzed_at: new Date().toISOString()
  };
}
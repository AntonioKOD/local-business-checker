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
}

export interface WebsiteStatus {
  status: 'accessible' | 'error' | 'timeout' | 'connection_error' | 'no_website';
  accessible: boolean;
  status_code: number | null;
  title: string | null;
  final_url?: string;
  error: string | null;
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
  };
  payment_info: {
    is_free_user: boolean;
    total_found: number;
    showing: number;
    remaining: number;
    upgrade_price: number;
  };
}

export class BusinessChecker {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async searchBusinesses(query: string, location: string, radius: number = 15000): Promise<Business[]> {
    try {
      // First, geocode the location to get coordinates
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

      // Search for places - get multiple pages for more results
      const allBusinesses: Business[] = [];
      let nextPageToken: string | undefined;
      const maxResults = 60;

      for (let page = 0; page < 3; page++) {
        const placesResponse = await this.client.placesNearby({
          params: {
            location: { lat, lng },
            radius,
            keyword: query,
            type: 'establishment',
            key: process.env.GOOGLE_MAPS_API_KEY!,
            ...(nextPageToken && { pagetoken: nextPageToken }),
          }
        });

        // Add businesses from this page
        for (const place of placesResponse.data.results) {
          const business: Business = {
            name: place.name || 'N/A',
            place_id: place.place_id!,
            rating: place.rating || 'N/A',
            address: place.vicinity || 'N/A',
            types: place.types || [],
            price_level: place.price_level || 'N/A'
          };
          allBusinesses.push(business);
        }

        // Check if there's a next page
        nextPageToken = placesResponse.data.next_page_token;
        if (!nextPageToken || allBusinesses.length >= maxResults) {
          break;
        }

        // Google requires a short delay before using next_page_token
        await new Promise(resolve => setTimeout(resolve, 2000));
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
            'type'
          ],
          key: process.env.GOOGLE_MAPS_API_KEY!,
        }
      });

      const result = placeDetailsResponse.data.result;
      const website = result.website;

      // Website detection completed silently

      return {
        name: result.name || 'N/A',
        website: website,
        phone: result.formatted_phone_number || 'N/A',
        address: result.formatted_address || 'N/A',
        rating: result.rating || 'N/A',
        total_ratings: result.user_ratings_total || 'N/A',
        hours: result.opening_hours?.weekday_text || [],
        price_level: result.price_level || 'N/A',
        types: result.types || []
      };

    } catch (error) {
      console.error('Error getting business details:', error);
      return {};
    }
  }

  async checkWebsiteStatus(url: string, timeout: number = 10000): Promise<WebsiteStatus> {
    if (!url) {
      return {
        status: 'no_website',
        accessible: false,
        status_code: null,
        title: null,
        error: 'No website provided'
      };
    }

    try {
      // Ensure URL has protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      clearTimeout(timeoutId);

      // Try to extract title from HTML
      let title: string | null = null;
      if (response.headers.get('content-type')?.includes('text/html')) {
        try {
          const text = await response.text();
          const titleMatch = text.match(/<title>(.*?)<\/title>/i);
          if (titleMatch) {
            title = titleMatch[1].trim();
          }
        } catch {
          // Ignore title extraction errors
        }
      }

      return {
        status: response.status === 200 ? 'accessible' : 'error',
        accessible: response.status === 200,
        status_code: response.status,
        title,
        final_url: response.url,
        error: null
      };

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          status: 'timeout',
          accessible: false,
          status_code: null,
          title: null,
          error: 'Request timeout'
        };
      }

      return {
        status: 'connection_error',
        accessible: false,
        status_code: null,
        title: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async analyzeBusinesses(query: string, location: string, radius: number = 15000): Promise<Business[]> {
    try {
      // Get list of businesses
      const businesses = await this.searchBusinesses(query, location, radius);
      
      // Get detailed information for each business
      const detailedBusinesses = await Promise.all(
        businesses.map(async (business) => {
          try {
            const details = await this.getBusinessDetails(business.place_id);
            const enhancedBusiness = { ...business, ...details };
            
            // Check website status if website exists
            if (enhancedBusiness.website) {
              const websiteStatus = await this.checkWebsiteStatus(enhancedBusiness.website);
              enhancedBusiness.website_status = websiteStatus;
            }
            
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
} 
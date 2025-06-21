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
  status: 'accessible' | 'error' | 'timeout' | 'connection_error' | 'no_website' | 'redirect_error' | 'ssl_error' | 'content_error' | 'parked_domain';
  accessible: boolean;
  status_code: number | null;
  title: string | null;
  final_url?: string;
  error: string | null;
  redirect_count?: number;
  response_time?: number;
  has_ssl?: boolean;
  content_type?: string;
  content_size?: number | null;
  is_parked_domain?: boolean;
  is_under_construction?: boolean;
  has_contact_info?: boolean;
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
    searches_remaining?: number | null;
  };
}

export class BusinessChecker {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async searchBusinesses(query: string, location: string, radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
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

      // Search for places - enhanced strategy for larger result sets
      const allBusinesses: Business[] = [];
      const seenPlaceIds = new Set<string>();

      // Strategy 1: Multiple radius searches for larger datasets
      const searchRadii = maxResults > 100 ? [radius * 0.3, radius * 0.6, radius] : [radius];
      
      for (const searchRadius of searchRadii) {
        let nextPageToken: string | undefined;

        // Get up to 3 pages per radius (60 results max per radius)
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

          // Add businesses from this page, avoiding duplicates
          for (const place of placesResponse.data.results) {
            if (!seenPlaceIds.has(place.place_id!) && allBusinesses.length < maxResults) {
              seenPlaceIds.add(place.place_id!);
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
          }

          // Check if there's a next page
          nextPageToken = placesResponse.data.next_page_token;
          if (!nextPageToken || allBusinesses.length >= maxResults) {
            break;
          }

          // Google requires a short delay before using next_page_token
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // If we have enough results, stop searching
        if (allBusinesses.length >= maxResults) {
          break;
        }

        // Small delay between radius searches
        if (searchRadii.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Strategy 2: Text search for additional results if needed
      if (allBusinesses.length < maxResults && maxResults > 60) {
        try {
          const textSearchResponse = await this.client.textSearch({
            params: {
              query: `${query} near ${geocodeResponse.data.results[0].formatted_address}`,
              key: process.env.GOOGLE_MAPS_API_KEY!,
            }
          });

          // Add unique results from text search
          for (const place of textSearchResponse.data.results) {
            if (!seenPlaceIds.has(place.place_id!) && allBusinesses.length < maxResults) {
              seenPlaceIds.add(place.place_id!);
              const business: Business = {
                name: place.name || 'N/A',
                place_id: place.place_id!,
                rating: place.rating || 'N/A',
                address: place.formatted_address || 'N/A',
                types: place.types || [],
                price_level: place.price_level || 'N/A'
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

  async checkWebsiteStatus(url: string, timeout: number = 15000): Promise<WebsiteStatus> {
    if (!url) {
      return {
        status: 'no_website',
        accessible: false,
        status_code: null,
        title: null,
        error: 'No website provided'
      };
    }

    const startTime = Date.now();
    let redirectCount = 0;
    const originalUrl = url;

    try {
      // Ensure URL has protocol and clean it up
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Check for SSL
      const hasSSL = url.startsWith('https://');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Enhanced fetch with better headers
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'manual', // Handle redirects manually to count them
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      // Handle redirects
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location && redirectCount < 5) {
          redirectCount++;
          return await this.checkWebsiteStatus(location, timeout);
        } else {
          return {
            status: 'redirect_error',
            accessible: false,
            status_code: response.status,
            title: null,
            final_url: response.url,
            error: 'Too many redirects or redirect loop',
            redirect_count: redirectCount,
            response_time: responseTime,
            has_ssl: hasSSL
          };
        }
      }

      // Get content type and size
      const contentType = response.headers.get('content-type') || '';
      const contentLength = response.headers.get('content-length');
      const contentSize = contentLength ? parseInt(contentLength) : null;

      // Check if it's not HTML content
      if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
        return {
          status: 'content_error',
          accessible: false,
          status_code: response.status,
          title: null,
          final_url: response.url,
          error: `Invalid content type: ${contentType}`,
          redirect_count: redirectCount,
          response_time: responseTime,
          has_ssl: hasSSL,
          content_type: contentType,
          content_size: contentSize
        };
      }

      let title: string | null = null;
      let isParkedDomain = false;
      let isUnderConstruction = false;
      let hasContactInfo = false;
      let htmlContent = '';

      // Get and analyze HTML content
      if (response.status === 200 && contentType.includes('text/html')) {
        try {
          htmlContent = await response.text();
          
          // Extract title
          const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
          if (titleMatch) {
            title = titleMatch[1].trim().replace(/\s+/g, ' ').substring(0, 100);
          }

          // Check for parked domain indicators
          const parkedIndicators = [
            'this domain is for sale',
            'domain parking',
            'parked domain',
            'buy this domain',
            'domain for sale',
            'sedo.com',
            'godaddy.com/domains',
            'afternic.com',
            'hugedomains.com',
            'dan.com'
          ];
          
          const lowerContent = htmlContent.toLowerCase();
          isParkedDomain = parkedIndicators.some(indicator => 
            lowerContent.includes(indicator) || (title && title.toLowerCase().includes(indicator))
          );

          // Check for under construction
          const constructionIndicators = [
            'under construction',
            'coming soon',
            'site under development',
            'website coming soon',
            'under development',
            'temporarily unavailable',
            'site maintenance'
          ];
          
          isUnderConstruction = constructionIndicators.some(indicator => 
            lowerContent.includes(indicator) || (title && title.toLowerCase().includes(indicator))
          );

          // Check for contact information
          const contactIndicators = [
            'contact',
            'phone',
            'email',
            'address',
            '@',
            'tel:',
            'mailto:',
            /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone pattern
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email pattern
          ];
          
          hasContactInfo = contactIndicators.some(indicator => {
            if (typeof indicator === 'string') {
              return lowerContent.includes(indicator);
            } else {
              return indicator.test(htmlContent);
            }
          });

                 } catch {
           // Content parsing failed, but response was received
         }
      }

      // Determine final status
      let finalStatus: WebsiteStatus['status'] = 'error';
      let accessible = false;

      if (response.status === 200) {
        if (isParkedDomain) {
          finalStatus = 'parked_domain';
          accessible = false;
        } else if (isUnderConstruction) {
          finalStatus = 'content_error';
          accessible = false;
        } else if (htmlContent.length < 500 && !hasContactInfo) {
          // Very small content with no contact info might be a placeholder
          finalStatus = 'content_error';
          accessible = false;
        } else {
          finalStatus = 'accessible';
          accessible = true;
        }
      } else if (response.status >= 400 && response.status < 500) {
        finalStatus = 'error';
        accessible = false;
      } else if (response.status >= 500) {
        finalStatus = 'error';
        accessible = false;
      }

      return {
        status: finalStatus,
        accessible,
        status_code: response.status,
        title,
        final_url: response.url,
        error: accessible ? null : `HTTP ${response.status}: ${this.getStatusMessage(response.status)}`,
        redirect_count: redirectCount,
        response_time: responseTime,
        has_ssl: hasSSL,
        content_type: contentType,
        content_size: contentSize,
        is_parked_domain: isParkedDomain,
        is_under_construction: isUnderConstruction,
        has_contact_info: hasContactInfo
      };

    } catch (error: unknown) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            status: 'timeout',
            accessible: false,
            status_code: null,
            title: null,
            error: `Request timeout after ${timeout}ms`,
            redirect_count: redirectCount,
            response_time: responseTime,
            has_ssl: originalUrl.startsWith('https://')
          };
        }

        // Check for SSL/TLS errors
        if (error.message.includes('SSL') || error.message.includes('TLS') || 
            error.message.includes('certificate') || error.message.includes('CERT_')) {
          return {
            status: 'ssl_error',
            accessible: false,
            status_code: null,
            title: null,
            error: 'SSL/TLS certificate error',
            redirect_count: redirectCount,
            response_time: responseTime,
            has_ssl: originalUrl.startsWith('https://')
          };
        }

        // Check for DNS/connection errors
        if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED') ||
            error.message.includes('ETIMEDOUT') || error.message.includes('getaddrinfo')) {
          return {
            status: 'connection_error',
            accessible: false,
            status_code: null,
            title: null,
            error: 'Domain not found or connection refused',
            redirect_count: redirectCount,
            response_time: responseTime,
            has_ssl: originalUrl.startsWith('https://')
          };
        }
      }

      return {
        status: 'connection_error',
        accessible: false,
        status_code: null,
        title: null,
        error: error instanceof Error ? error.message : 'Unknown connection error',
        redirect_count: redirectCount,
        response_time: responseTime,
        has_ssl: originalUrl.startsWith('https://')
      };
    }
  }

  private getStatusMessage(statusCode: number): string {
    const statusMessages: { [key: number]: string } = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      408: 'Request Timeout',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };
    
    return statusMessages[statusCode] || 'Unknown Error';
  }

  async analyzeBusinesses(query: string, location: string, radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
    try {
      // Get list of businesses
      const businesses = await this.searchBusinesses(query, location, radius, maxResults);
      
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
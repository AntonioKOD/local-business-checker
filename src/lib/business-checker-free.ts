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
  accessible: boolean;
  status_code: number;
  error?: string;
  load_time?: number;
  has_ssl?: boolean;
  redirects?: number;
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

export class FreeBusinessChecker {
  private foursquareApiKey: string;

  constructor() {
    this.foursquareApiKey = process.env.FOURSQUARE_API_KEY || '';
  }

  // Method 1: Using Foursquare Places API (100k free requests/month)
  async searchBusinessesFoursquare(query: string, location: string, radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
    if (!this.foursquareApiKey) {
      console.warn('Foursquare API key not configured');
      return [];
    }

    try {
      // For radius support, we need to use ll (lat,lng) + radius
      // First, try to get coordinates using a simple geocoding approach
      let useRadius = false;
      let lat: number, lng: number;

      // Try to geocode the location using a simple approach
      try {
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`);
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.length > 0) {
            lat = parseFloat(geocodeData[0].lat);
            lng = parseFloat(geocodeData[0].lon);
            useRadius = true;
            console.log(`Geocoded ${location} to ${lat},${lng}`);
          }
        }
      } catch (geocodeError) {
        console.log('Geocoding failed, using location name only');
      }

      const searchUrl = new URL('https://api.foursquare.com/v3/places/search');
      searchUrl.searchParams.set('query', query);
      
      if (useRadius && lat && lng) {
        // Use coordinates with radius for precise control
        searchUrl.searchParams.set('ll', `${lat},${lng}`);
        searchUrl.searchParams.set('radius', Math.min(radius, 50000).toString()); // Max 50km
        console.log(`Using radius search: ${radius}m around ${lat},${lng}`);
      } else {
        // Fallback to location name only
        searchUrl.searchParams.set('near', location);
        console.log(`Using location name search: ${location}`);
      }
      
      searchUrl.searchParams.set('limit', Math.min(maxResults, 50).toString());
      searchUrl.searchParams.set('fields', 'fsq_id,name,location,categories,rating,price,tel,website,hours');

      console.log('Foursquare API Request URL:', searchUrl.toString());
      console.log('Foursquare API Key prefix:', this.foursquareApiKey.substring(0, 10) + '...');

      const searchResponse = await fetch(searchUrl.toString(), {
        headers: {
          'Authorization': this.foursquareApiKey,
          'Accept': 'application/json'
        }
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Foursquare API error:', searchResponse.status, errorText);
        throw new Error(`Foursquare API error: ${searchResponse.status} ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();
      return this.formatFoursquareResults(searchData);

    } catch (error) {
      console.error('Error searching businesses with Foursquare:', error);
      return [];
    }
  }



  // Use only Foursquare API for business search
  async searchBusinesses(query: string, location: string, radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
    try {
      // Use Foursquare exclusively
      if (this.foursquareApiKey) {
        const foursquareResults = await this.searchBusinessesFoursquare(query, location, radius, maxResults);
        return foursquareResults.map(business => ({
          ...business, 
          place_id: `4sq_${business.place_id}`
        }));
      } else {
        console.error('Foursquare API key is required');
        return [];
      }

    } catch (error) {
      console.error('Error in business search:', error);
      return [];
    }
    }

  // Helper method to format Foursquare results
  private formatFoursquareResults(searchData: any): Business[] {
    if (!searchData.results || searchData.results.length === 0) {
      console.log('No results found in Foursquare response');
      return [];
    }

    return searchData.results.map((place: any): Business => ({
      name: place.name || 'N/A',
      place_id: place.fsq_id,
      rating: place.rating || 'N/A',
      address: place.location?.formatted_address || [
        place.location?.address,
        place.location?.locality,
        place.location?.region,
        place.location?.postcode
      ].filter(Boolean).join(', ') || 'N/A',
      types: place.categories?.map((cat: any) => cat.name) || [],
      price_level: place.price || 'N/A',
      website: place.website,
      phone: place.tel,
      total_ratings: 'N/A', // Foursquare doesn't provide this in basic search
      hours: place.hours?.display ? [place.hours.display] : []
    }));
  }

  // Enhanced website checking (same as before but with more features)
  async checkWebsiteStatus(url: string): Promise<WebsiteStatus> {
    try {
      if (!url || url === 'N/A') {
        return {
          accessible: false,
          status_code: 0,
          error: 'No website provided'
        };
      }

      // Ensure URL has protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'BusinessChecker/1.0 (+https://buildquick.io)'
          }
        });

        clearTimeout(timeoutId);
        const loadTime = (Date.now() - startTime) / 1000;

        return {
          accessible: response.ok,
          status_code: response.status,
          load_time: loadTime,
          has_ssl: url.startsWith('https://'),
          redirects: response.redirected ? 1 : 0
        };

      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // If HTTPS fails, try HTTP
        if (url.startsWith('https://')) {
          const httpUrl = url.replace('https://', 'http://');
          return await this.checkWebsiteStatus(httpUrl);
        }

        const loadTime = (Date.now() - startTime) / 1000;
        return {
          accessible: false,
          status_code: 0,
          error: fetchError instanceof Error ? fetchError.message : 'Network error',
          load_time: loadTime
        };
      }

    } catch (error) {
      return {
        accessible: false,
        status_code: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async analyzeBusinesses(query: string, location: string, radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
    try {
      // Get list of businesses using free APIs
      const businesses = await this.searchBusinesses(query, location, radius, maxResults);
      
      // Check website status for each business
      const detailedBusinesses = await Promise.all(
        businesses.map(async (business) => {
          try {
            // Check website status if website exists
            if (business.website && business.website !== 'N/A') {
              const websiteStatus = await this.checkWebsiteStatus(business.website);
              business.website_status = websiteStatus;
            }
            
            return business;
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
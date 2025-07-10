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

  // Method 1: Using OpenStreetMap Nominatim API (Completely Free)
  async searchBusinessesNominatim(query: string, location: string, radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
    try {
      console.log(`Searching for '${query}' in '${location}' using Nominatim...`);
      
      // First, geocode the location
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;
      console.log('Geocoding URL:', geocodeUrl);
      
      const geocodeResponse = await fetch(geocodeUrl, {
        headers: {
          'User-Agent': 'BusinessChecker/1.0 (business search application)'
        }
      });
      
      if (!geocodeResponse.ok) {
        throw new Error(`Geocoding failed: ${geocodeResponse.status}`);
      }
      
      const geocodeData = await geocodeResponse.json();
      if (geocodeData.length === 0) {
        console.log('Location not found in geocoding');
        return [];
      }
      
      const lat = parseFloat(geocodeData[0].lat);
      const lng = parseFloat(geocodeData[0].lon);
      console.log(`Geocoded to: ${lat}, ${lng}`);
      
      // Search for businesses near the location
      const searchTerms = [
        `${query} ${location}`,
        `${query} near ${location}`,
        query
      ];
      
      const allBusinesses: Business[] = [];
      const seenNames = new Set<string>();
      
      for (const searchTerm of searchTerms) {
        if (allBusinesses.length >= maxResults) break;
        
        try {
          const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=${Math.min(maxResults * 2, 50)}&extratags=1&addressdetails=1`;
          console.log('Search URL:', searchUrl);
          
          const searchResponse = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'BusinessChecker/1.0 (business search application)'
            }
          });
          
          if (!searchResponse.ok) {
            console.warn(`Search failed for "${searchTerm}": ${searchResponse.status}`);
            continue;
          }
          
          const searchData = await searchResponse.json();
          console.log(`Found ${searchData.length} results for "${searchTerm}"`);
          
          for (const place of searchData) {
            if (allBusinesses.length >= maxResults) break;
            
            // Skip if we've already seen this business name
            const businessName = place.display_name?.split(',')[0] || place.name || 'Unknown Business';
            if (seenNames.has(businessName.toLowerCase())) continue;
            
            // Calculate distance from center
            const placeLat = parseFloat(place.lat);
            const placeLng = parseFloat(place.lon);
            const distance = this.calculateDistance(lat, lng, placeLat, placeLng);
            
            // Skip if too far from search center
            if (distance > radius / 1000) continue; // Convert meters to km
            
            // Extract business information
            const business: Business = {
              name: businessName,
              place_id: `osm_${place.osm_type}_${place.osm_id}`,
              rating: 'N/A',
              address: place.display_name || 'N/A',
              types: this.extractTypes(place),
              price_level: 'N/A',
              website: place.extratags?.website || place.extratags?.['contact:website'] || undefined,
              phone: place.extratags?.phone || place.extratags?.['contact:phone'] || undefined,
              total_ratings: 'N/A',
              hours: this.extractHours(place.extratags),
              location: {
                lat: placeLat,
                lng: placeLng
              }
            };
            
            allBusinesses.push(business);
            seenNames.add(businessName.toLowerCase());
          }
          
          // Add delay between requests to be respectful
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.warn(`Error searching for "${searchTerm}":`, error);
        }
      }
      
      console.log(`Total businesses found: ${allBusinesses.length}`);
      return allBusinesses;
      
    } catch (error) {
      console.error('Error searching businesses with Nominatim:', error);
      return [];
    }
  }

  // Helper method to calculate distance between two points
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Extract business types from OSM data
  private extractTypes(place: { type?: string; class?: string; extratags?: Record<string, string> }): string[] {
    const types: string[] = [];
    
    if (place.type) types.push(place.type);
    if (place.class) types.push(place.class);
    
    // Extract from extra tags
    if (place.extratags) {
      if (place.extratags.amenity) types.push(place.extratags.amenity);
      if (place.extratags.shop) types.push(place.extratags.shop);
      if (place.extratags.cuisine) types.push(place.extratags.cuisine);
      if (place.extratags.tourism) types.push(place.extratags.tourism);
    }
    
    return types.filter((type, index, self) => self.indexOf(type) === index); // Remove duplicates
  }

  // Extract opening hours from OSM data
  private extractHours(extratags: Record<string, string> | undefined): string[] {
    if (!extratags) return [];
    
    const hours: string[] = [];
    if (extratags.opening_hours) {
      hours.push(extratags.opening_hours);
    }
    
    return hours;
  }

  // Method 2: Using Foursquare Places API (fallback if API credits available)
  async searchBusinessesFoursquare(query: string, location: string, radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
    if (!this.foursquareApiKey) {
      console.warn('Foursquare API key not configured');
      return [];
    }

    try {
      // For radius support, we need to use ll (lat,lng) + radius
      // First, try to get coordinates using a simple geocoding approach
      let useRadius = false;
      let lat: number | undefined, lng: number | undefined;

      // Try to geocode the location using a simple approach
      try {
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`, {
          headers: {
            'User-Agent': 'BusinessChecker/1.0 (business search application)'
          }
        });
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.length > 0) {
            lat = parseFloat(geocodeData[0].lat);
            lng = parseFloat(geocodeData[0].lon);
            useRadius = true;
            console.log(`Geocoded ${location} to ${lat},${lng}`);
          }
        }
      } catch {
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

      const searchResponse = await fetch(searchUrl.toString(), {
        headers: {
          'Authorization': this.foursquareApiKey,
          'Accept': 'application/json'
        }
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Foursquare API error:', searchResponse.status, errorText);
        
        // If rate limited or no credits, return empty array to use fallback
        if (searchResponse.status === 429 || errorText.includes('credits')) {
          console.log('Foursquare API has no credits or is rate limited, using free alternatives');
          return [];
        }
        
        throw new Error(`Foursquare API error: ${searchResponse.status} ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();
      return this.formatFoursquareResults(searchData);

    } catch (error) {
      console.error('Error searching businesses with Foursquare:', error);
      return [];
    }
  }

  // Use Nominatim as primary, Foursquare as fallback
  async searchBusinesses(query: string, location: string, radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
    try {
      console.log(`Searching for businesses: "${query}" in "${location}"`);
      
      // Try Nominatim first (free and reliable)
      let businesses = await this.searchBusinessesNominatim(query, location, radius, maxResults);
      
      // If we didn't get enough results and have Foursquare API key, try it as fallback
      if (businesses.length < maxResults && this.foursquareApiKey) {
        console.log(`Only found ${businesses.length} businesses with Nominatim, trying Foursquare as fallback...`);
        try {
          const foursquareResults = await this.searchBusinessesFoursquare(query, location, radius, maxResults - businesses.length);
          
          // Add foursquare results that don't duplicate existing ones
          const existingNames = new Set(businesses.map(b => b.name.toLowerCase()));
          const newResults = foursquareResults.filter(b => !existingNames.has(b.name.toLowerCase()));
          
          businesses = [...businesses, ...newResults.map(business => ({
            ...business, 
            place_id: `4sq_${business.place_id}`
          }))];
        } catch (error) {
          console.warn('Foursquare fallback failed:', error);
        }
      }
      
      console.log(`Total businesses found: ${businesses.length}`);
      return businesses.slice(0, maxResults);

    } catch (error) {
      console.error('Error in business search:', error);
      return [];
    }
  }

  // Helper method to format Foursquare results
  private formatFoursquareResults(searchData: { results?: Array<{
    name?: string;
    fsq_id: string;
    rating?: number;
    location?: {
      formatted_address?: string;
      address?: string;
      locality?: string;
      region?: string;
      postcode?: string;
    };
    categories?: Array<{ name: string }>;
    price?: number;
    website?: string;
    tel?: string;
    hours?: { display?: string };
  }> }): Business[] {
    if (!searchData.results || searchData.results.length === 0) {
      console.log('No results found in Foursquare response');
      return [];
    }

    return searchData.results.map((place): Business => ({
      name: place.name || 'N/A',
      place_id: place.fsq_id,
      rating: place.rating || 'N/A',
      address: place.location?.formatted_address || [
        place.location?.address,
        place.location?.locality,
        place.location?.region,
        place.location?.postcode
      ].filter(Boolean).join(', ') || 'N/A',
      types: place.categories?.map((cat) => cat.name) || [],
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
      let redirects = 0;
      
      // Use a more comprehensive fetch with timeout and redirect tracking
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(url, {
          method: 'HEAD', // HEAD request is faster for checking availability
          signal: controller.signal,
          redirect: 'follow',
          headers: {
            'User-Agent': 'BusinessChecker/1.0 (website status checker)'
          }
        });
        
        clearTimeout(timeoutId);
        const loadTime = (Date.now() - startTime) / 1000;
        
        // Count redirects by checking if final URL is different
        if (response.url !== url) {
          redirects = 1; // Simplified redirect counting
        }
        
        return {
          accessible: response.ok,
          status_code: response.status,
          load_time: loadTime,
          has_ssl: url.startsWith('https://'),
          redirects: redirects
        };
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return {
            accessible: false,
            status_code: 0,
            error: 'Request timeout',
            load_time: 10.0,
            has_ssl: url.startsWith('https://'),
            redirects: 0
          };
        }
        
        throw fetchError;
      }

    } catch (error) {
      return {
        accessible: false,
        status_code: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        has_ssl: url?.startsWith('https://') || false,
        redirects: 0
      };
    }
  }

  async analyzeBusinesses(query: string, location: string, radius: number = 15000, maxResults: number = 10): Promise<Business[]> {
    try {
      // Get list of businesses using free APIs
      const businesses = await this.searchBusinesses(query, location, radius, maxResults);
      
      if (businesses.length === 0) {
        console.log('No businesses found for the search query');
        return [];
      }
      
      console.log(`Analyzing ${businesses.length} businesses...`);
      
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
import googlemaps
import requests
from urllib.parse import urlparse
import time
from typing import List, Dict, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class BusinessChecker:
    def __init__(self, api_key: str):
        """Initialize the BusinessChecker with Google Maps API key."""
        self.gmaps = googlemaps.Client(key=api_key)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def search_businesses(self, query: str, location: str, radius: int = 15000) -> List[Dict]:
        """
        Search for businesses using Google Places API.
        
        Args:
            query: Business type or keyword (e.g., "restaurants", "dentist")
            location: Location to search (e.g., "New York, NY")
            radius: Search radius in meters (default 5000m = 5km)
        
        Returns:
            List of business dictionaries with details
        """
        try:
            # First, geocode the location to get coordinates
            geocode_result = self.gmaps.geocode(location)
            if not geocode_result:
                raise ValueError(f"Could not find location: {location}")
            
            lat_lng = geocode_result[0]['geometry']['location']
            
            # Search for places - get multiple pages for more results
            all_businesses = []
            next_page_token = None
            max_results = 60  # Get up to 60 businesses (3 pages of 20 each)
            
            for page in range(3):  # Maximum 3 pages
                places_result = self.gmaps.places_nearby(
                    location=lat_lng,
                    radius=radius,
                    keyword=query,
                    type='establishment',
                    page_token=next_page_token
                )
                
                # Add businesses from this page
                for place in places_result.get('results', []):
                    business = {
                        'name': place.get('name', 'N/A'),
                        'place_id': place.get('place_id'),
                        'rating': place.get('rating', 'N/A'),
                        'address': place.get('vicinity', 'N/A'),
                        'types': place.get('types', []),
                        'price_level': place.get('price_level', 'N/A')
                    }
                    all_businesses.append(business)
                
                # Check if there's a next page
                next_page_token = places_result.get('next_page_token')
                if not next_page_token or len(all_businesses) >= max_results:
                    break
                    
                # Google requires a short delay before using next_page_token
                time.sleep(2)
            
            print(f"Found {len(all_businesses)} businesses in {radius/1000}km radius")
            return all_businesses[:max_results]  # Limit to max_results
            
        except Exception as e:
            print(f"Error searching businesses: {str(e)}")
            return []
    
    def get_business_details(self, place_id: str) -> Dict:
        """
        Get detailed information about a business including website.
        
        Args:
            place_id: Google Places API place ID
            
        Returns:
            Dictionary with detailed business information
        """
        try:
            place_details = self.gmaps.place(
                place_id=place_id,
                fields=['name', 'website', 'formatted_phone_number', 
                       'formatted_address', 'rating', 'user_ratings_total',
                       'opening_hours', 'price_level', 'type']
            )
            
            result = place_details.get('result', {})
            website = result.get('website')
            
            # Debug logging for website detection
            business_name = result.get('name', 'Unknown')
            if website:
                print(f"✅ Website found for {business_name}: {website}")
            else:
                print(f"❌ No website found for {business_name}")
                print(f"   Available fields: {list(result.keys())}")
            
            return {
                'name': result.get('name', 'N/A'),
                'website': website,
                'phone': result.get('formatted_phone_number', 'N/A'),
                'address': result.get('formatted_address', 'N/A'),
                'rating': result.get('rating', 'N/A'),
                'total_ratings': result.get('user_ratings_total', 'N/A'),
                'hours': result.get('opening_hours', {}).get('weekday_text', []),
                'price_level': result.get('price_level', 'N/A'),
                'types': result.get('type', [])
            }
            
        except Exception as e:
            print(f"Error getting business details: {str(e)}")
            return {}
    
    def check_website_status(self, url: str, timeout: int = 10) -> Dict:
        """
        Check if a website is accessible and get basic information.
        
        Args:
            url: Website URL to check
            timeout: Request timeout in seconds
            
        Returns:
            Dictionary with website status information
        """
        if not url:
            return {
                'status': 'no_website',
                'accessible': False,
                'status_code': None,
                'title': None,
                'error': 'No website provided'
            }
        
        try:
            # Ensure URL has protocol
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            response = self.session.get(url, timeout=timeout, allow_redirects=True)
            
            # Try to extract title from HTML
            title = None
            if 'text/html' in response.headers.get('content-type', ''):
                try:
                    import re
                    title_match = re.search(r'<title>(.*?)</title>', response.text, re.IGNORECASE)
                    if title_match:
                        title = title_match.group(1).strip()
                except:
                    pass
            
            return {
                'status': 'accessible' if response.status_code == 200 else 'error',
                'accessible': response.status_code == 200,
                'status_code': response.status_code,
                'title': title,
                'final_url': response.url,
                'error': None
            }
            
        except requests.exceptions.Timeout:
            return {
                'status': 'timeout',
                'accessible': False,
                'status_code': None,
                'title': None,
                'error': 'Request timeout'
            }
        except requests.exceptions.ConnectionError:
            return {
                'status': 'connection_error',
                'accessible': False,
                'status_code': None,
                'title': None,
                'error': 'Connection failed'
            }
        except Exception as e:
            return {
                'status': 'error',
                'accessible': False,
                'status_code': None,
                'title': None,
                'error': str(e)
            }
    
    def analyze_businesses(self, query: str, location: str, radius: int = 15000) -> List[Dict]:
        """
        Complete analysis: search businesses and check their websites.
        
        Args:
            query: Business type or keyword
            location: Location to search
            radius: Search radius in meters
            
        Returns:
            List of businesses with website analysis
        """
        print(f"Searching for '{query}' businesses in {location}...")
        businesses = self.search_businesses(query, location, radius)
        
        results = []
        for i, business in enumerate(businesses, 1):
            print(f"Analyzing business {i}/{len(businesses)}: {business['name']}")
            
            # Get detailed information
            details = self.get_business_details(business['place_id'])
            
            # Check website status
            website_info = self.check_website_status(details.get('website'))
            
            # Combine all information
            complete_info = {
                **business,
                **details,
                'website_status': website_info
            }
            
            results.append(complete_info)
            
            # Rate limiting - be respectful to APIs
            time.sleep(0.5)
        
        return results


def main():
    """Example usage of the BusinessChecker."""
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    if not api_key:
        print("Please set GOOGLE_MAPS_API_KEY environment variable")
        return
    
    checker = BusinessChecker(api_key)
    
    # Example search
    results = checker.analyze_businesses(
        query="restaurants",
        location="San Francisco, CA",
        radius=2000
    )
    
    # Print results
    print(f"\nFound {len(results)} businesses:")
    for business in results:
        print(f"\n{business['name']}")
        print(f"  Address: {business['address']}")
        print(f"  Rating: {business['rating']}")
        print(f"  Website: {business.get('website', 'None')}")
        print(f"  Website Status: {business['website_status']['status']}")


if __name__ == "__main__":
    main()

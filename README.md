# Local Business Website Checker

This application finds local Google businesses and checks if they have websites. It provides a comprehensive analysis of business web presence in any location.

## Features

- 🔍 **Search Local Businesses**: Find businesses by type and location using Google Places API
- 🌐 **Website Verification**: Automatically check if businesses have accessible websites
- 📊 **Statistics Dashboard**: View comprehensive stats on website coverage
- 🎯 **Smart Filtering**: Filter results by website status (all, with website, no website, accessible, not accessible)
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices
- 🎨 **Visual Status Indicators**: Color-coded cards to quickly identify website status
- 📍 **Location Detection**: Optional auto-location using browser geolocation
- 💳 **Freemium Model**: 5 free results, upgrade for $6 to unlock all available results

## Prerequisites

- Python 3.7+
- Google Maps API Key with Places API enabled
- Stripe Account (for payment processing) - Optional

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd local-business-checker
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Copy your API key

### 4. Configure Environment Variables

Create a `.env` file in the project root:
```bash
cp env.example .env
```

Edit the `.env` file and add your API key:
```
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
SECRET_KEY=your-secret-key-here

# Optional: For payment processing
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
```

**Note**: See `STRIPE_SETUP.md` for detailed Stripe configuration instructions.

### 5. Run the Application

```bash
python web_app.py
```

The application will be available at: `http://localhost:5000`

## Usage

1. **Enter Search Criteria**:
   - Business Type: e.g., "restaurants", "dentists", "hair salons"
   - Location: e.g., "San Francisco, CA", "New York, NY"
   - Search Radius: Choose from 1km to 20km

2. **View Results**:
   - Total businesses found
   - Statistics on website coverage
   - Individual business cards with details

3. **Filter Results**:
   - **All**: Show all businesses
   - **With Website**: Businesses that have websites
   - **No Website**: Businesses without websites
   - **Accessible**: Websites that are accessible
   - **Not Accessible**: Websites that have issues

## API Endpoints

### `POST /search`
Search for businesses and analyze their websites.

**Request Body**:
```json
{
  "query": "restaurants",
  "location": "San Francisco, CA",
  "radius": 5000
}
```

**Response**:
```json
{
  "businesses": [...],
  "statistics": {
    "total_businesses": 20,
    "businesses_with_websites": 15,
    "accessible_websites": 12,
    "no_website_count": 5,
    "website_percentage": 75.0,
    "accessible_percentage": 80.0
  }
}
```

### `POST /check_website`
Check a single website status.

**Request Body**:
```json
{
  "url": "https://example.com"
}
```

## File Structure

```
local-business-checker/
├── business_checker.py      # Core business analysis logic
├── web_app.py              # Flask web application
├── requirements.txt        # Python dependencies
├── env.example            # Environment variables template
├── README.md              # This file
├── templates/
│   └── index.html         # Main web interface
└── static/
    ├── css/
    │   └── style.css      # Styling
    └── js/
        └── app.js         # Frontend JavaScript
```

## Core Components

### BusinessChecker Class
- **search_businesses()**: Find businesses using Google Places API
- **get_business_details()**: Get detailed business information
- **check_website_status()**: Verify website accessibility
- **analyze_businesses()**: Complete analysis workflow

### Web Interface
- Modern, responsive design
- Real-time search with loading states
- Interactive filtering and statistics
- Error handling and user feedback

## Website Status Categories

1. **No Website Found**: Business has no website listed on Google
2. **Website Accessible**: Website loads successfully (HTTP 200)
3. **Website Not Accessible**: Website exists but has issues (timeout, connection error, etc.)

## Rate Limiting

The application includes built-in rate limiting to respect API quotas:
- 0.5 second delay between business detail requests
- Efficient batching of API calls

## Error Handling

- Comprehensive error messages for users
- Graceful handling of API failures
- Network timeout management
- Invalid input validation

## Troubleshooting

### Common Issues

1. **"Google Maps API key not configured"**
   - Make sure you've set `GOOGLE_MAPS_API_KEY` in your `.env` file
   - Verify the API key is correct

2. **"Could not find location"**
   - Check that the location format is correct (e.g., "City, State")
   - Try a more specific location

3. **No results found**
   - Try a broader search term
   - Increase the search radius
   - Verify the location is correct

### API Quotas

- Google Places API has usage limits
- Monitor your usage in Google Cloud Console
- Consider implementing caching for repeated searches

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For support, please open an issue on the GitHub repository with:
- Detailed description of the problem
- Steps to reproduce
- Error messages (if any)
- Environment details

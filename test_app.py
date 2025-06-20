#!/usr/bin/env python3
import os
from dotenv import load_dotenv

load_dotenv()

print("🔍 Testing Local Business Checker Setup...")
print("=" * 50)

# Check Python version
import sys
print(f"✅ Python version: {sys.version}")

# Check imports
try:
    import flask
    print(f"✅ Flask version: {flask.__version__}")
except ImportError as e:
    print(f"❌ Flask import error: {e}")

try:
    import googlemaps
    print(f"✅ Google Maps client imported successfully")
except ImportError as e:
    print(f"❌ Google Maps import error: {e}")

try:
    from business_checker import BusinessChecker
    print(f"✅ BusinessChecker imported successfully")
except ImportError as e:
    print(f"❌ BusinessChecker import error: {e}")

# Check environment variables
api_key = os.getenv('GOOGLE_MAPS_API_KEY')
if not api_key or api_key == 'your_google_maps_api_key_here':
    print("⚠️  Google Maps API key not configured")
    print("   Please edit .env file and add your API key")
else:
    print("✅ Google Maps API key found in environment")
    # Test the API key
    try:
        checker = BusinessChecker(api_key)
        print("✅ Google Maps API key is valid!")
    except Exception as e:
        print(f"❌ API key validation error: {e}")

print("=" * 50)

# Try to start Flask app
try:
    from flask import Flask
    app = Flask(__name__)
    
    @app.route('/')
    def test():
        return "<h1>✅ Flask app is working!</h1><p>Your business checker is ready to use.</p>"
    
    print("🚀 Starting test Flask server...")
    print("   Visit: http://localhost:5000")
    print("   Press Ctrl+C to stop")
    
    app.run(debug=True, host='0.0.0.0', port=5000)

except Exception as e:
    print(f"❌ Error starting Flask app: {e}")
    import traceback
    traceback.print_exc() 
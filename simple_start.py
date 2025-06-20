#!/usr/bin/env python3

# Simple startup script for Local Business Checker
import os
import sys
from flask import Flask, render_template, request, jsonify

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)
app.config['SECRET_KEY'] = 'development-key-change-in-production'

# For now, we'll run without Google Maps API to test the interface
print("🚀 Starting Local Business Checker...")
print("📍 Running without Google Maps API for now")
print("🌐 Visit: http://localhost:5000")
print("⚠️  To enable full functionality, add your Google Maps API key to .env file")
print("=" * 60)

@app.route('/')
def index():
    """Main page with search form."""
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search_businesses():
    """API endpoint - returns demo data for now."""
    return jsonify({
        'error': 'Please configure your Google Maps API key in the .env file to enable search functionality.'
    }), 400

@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'running',
        'message': 'Local Business Checker is running successfully!'
    })

if __name__ == '__main__':
    try:
        # Create templates and static directories if they don't exist
        os.makedirs('templates', exist_ok=True)
        os.makedirs('static/css', exist_ok=True)
        os.makedirs('static/js', exist_ok=True)
        
        print("✅ Starting Flask development server...")
        app.run(debug=True, host='127.0.0.1', port=5000, use_reloader=False)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        import traceback
        traceback.print_exc() 
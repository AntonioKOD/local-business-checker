#!/usr/bin/env python3

from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-key'

@app.route('/')
def home():
    """Main page - try to load template, fallback to inline HTML if needed."""
    try:
        return render_template('index.html')
    except:
        return '''
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Local Business Website Checker</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                    color: white;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: rgba(255,255,255,0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .header { text-align: center; margin-bottom: 40px; }
                .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
                .status {
                    background: #51cf66;
                    padding: 20px;
                    border-radius: 15px;
                    text-align: center;
                    margin: 20px 0;
                }
                .form-card {
                    background: rgba(255,255,255,0.1);
                    padding: 30px;
                    border-radius: 15px;
                    margin: 20px 0;
                }
                .form-group {
                    margin: 20px 0;
                }
                label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                }
                input, select {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid rgba(255,255,255,0.2);
                    border-radius: 10px;
                    font-size: 16px;
                    background: rgba(255,255,255,0.9);
                    color: #333;
                }
                input:focus, select:focus {
                    outline: none;
                    border-color: #ffd700;
                }
                .search-btn {
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 20px;
                    transition: transform 0.2s;
                }
                .search-btn:hover { transform: translateY(-2px); }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔍 Local Business Website Checker</h1>
                    <p>Find local businesses and check if they have websites</p>
                </div>
                
                <div class="status">
                    ✅ Server running successfully on PORT 5001!<br>
                    <strong>http://localhost:5001</strong>
                </div>
                
                <div class="form-card">
                    <form id="searchForm">
                        <div class="form-group">
                            <label>🏪 Business Type</label>
                            <input type="text" placeholder="e.g., restaurants, dentists, hair salons" id="query">
                        </div>
                        
                        <div class="form-group">
                            <label>📍 Location</label>
                            <input type="text" placeholder="e.g., San Francisco, CA" id="location">
                        </div>
                        
                        <div class="form-group">
                            <label>🎯 Search Radius</label>
                            <select id="radius">
                                <option value="1000">1 km</option>
                                <option value="2000">2 km</option>
                                <option value="5000" selected>5 km</option>
                                <option value="10000">10 km</option>
                            </select>
                        </div>
                        
                        <button type="submit" class="search-btn">
                            🔍 Search Businesses
                        </button>
                    </form>
                </div>
                
                <div style="text-align: center; margin-top: 30px; opacity: 0.8;">
                    <p>⚠️ Add your Google Maps API key to .env file to enable search</p>
                    <p>Built with Flask • Powered by Google Places API</p>
                </div>
            </div>
            
            <script>
                document.getElementById('searchForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    alert('Add your Google Maps API key to the .env file to enable search functionality!');
                });
            </script>
        </body>
        </html>
        '''

@app.route('/search', methods=['POST'])
def search():
    # Return demo data with proper structure to prevent JavaScript errors
    return jsonify({
        'businesses': [
            {
                'name': 'Demo Restaurant',
                'address': 'Please add your Google Maps API key to enable real search',
                'rating': 'N/A',
                'website': None,
                'website_status': {
                    'status': 'no_api_key',
                    'accessible': False,
                    'error': 'API key required'
                }
            }
        ],
        'statistics': {
            'total_businesses': 0,
            'businesses_with_websites': 0,
            'accessible_websites': 0,
            'no_website_count': 0,
            'website_percentage': 0,
            'accessible_percentage': 0
        },
        'message': 'Please add your Google Maps API key to the .env file to enable real search functionality.'
    }), 200

@app.route('/health')
def health():
    return jsonify({
        'status': 'running',
        'port': 5001,
        'message': 'Local Business Website Checker is running on port 5001!'
    })

if __name__ == '__main__':
    print("🚀 Local Business Website Checker")
    print("=" * 50)
    print("🌐 Server starting on PORT 5001")
    print("📍 Visit: http://localhost:5001")
    print("⚠️  Add Google Maps API key to .env for full functionality")
    print("🛑 Press Ctrl+C to stop")
    print("=" * 50)
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        use_reloader=False
    ) 
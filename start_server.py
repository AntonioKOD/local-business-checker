#!/usr/bin/env python3

import os
import sys
from flask import Flask, render_template, request, jsonify

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'development-key-change-in-production'
app.config['WTF_CSRF_ENABLED'] = False  # Disable CSRF for development

print("🚀 Local Business Website Checker")
print("=" * 50)
print("📍 Server starting without Google Maps API")
print("⚠️  Add your API key to .env file for full functionality")
print("🌐 Access the app at: http://localhost:5001")
print("=" * 50)

@app.route('/')
def index():
    """Main page with search form."""
    try:
        return render_template('index.html')
    except Exception as e:
        # Fallback HTML if template is missing
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Local Business Website Checker</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 40px;
                    color: white;
                    min-height: 100vh;
                }}
                .container {{
                    max-width: 800px;
                    margin: 0 auto;
                    background: rgba(255,255,255,0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                }}
                .error {{ background: #ff6b6b; padding: 20px; border-radius: 10px; margin: 20px 0; }}
                .success {{ background: #51cf66; padding: 20px; border-radius: 10px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🔍 Local Business Website Checker</h1>
                <div class="success">
                    ✅ Server is running successfully!
                </div>
                <div class="error">
                    ⚠️ Template not found. Please ensure templates/index.html exists.
                </div>
                <p>To enable full functionality:</p>
                <ol>
                    <li>Get your Google Maps API key from Google Cloud Console</li>
                    <li>Edit the .env file and add your API key</li>
                    <li>Restart the server with: python3 web_app.py</li>
                </ol>
                <p><strong>Error details:</strong> {str(e)}</p>
            </div>
        </body>
        </html>
        """

@app.route('/search', methods=['POST'])
def search_businesses():
    """API endpoint - placeholder for now."""
    return jsonify({
        'error': 'Please configure your Google Maps API key in the .env file to enable search functionality.',
        'message': 'The web interface is working correctly!'
    }), 200

@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'running',
        'message': 'Local Business Checker is running successfully!',
        'server': 'Flask development server',
        'port': 5001
    })

@app.route('/test')
def test():
    """Simple test page."""
    return """
    <h1 style="color: green;">✅ Server is Working!</h1>
    <p>Your Local Business Website Checker is running correctly.</p>
    <p><a href="/">Go to Main Page</a></p>
    <p><a href="/health">Check Server Health</a></p>
    """

if __name__ == '__main__':
    try:
        # Create directories if they don't exist
        os.makedirs('templates', exist_ok=True)
        os.makedirs('static/css', exist_ok=True)
        os.makedirs('static/js', exist_ok=True)
        
        print("✅ Starting Flask server on port 5001...")
        
        # Use port 5001 to avoid conflicts with macOS AirPlay
        app.run(
            debug=True,
            host='0.0.0.0',  # Listen on all interfaces
            port=5001,       # Use port 5001 instead of 5000
            use_reloader=False,
            threaded=True
        )
        
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        import traceback
        traceback.print_exc() 
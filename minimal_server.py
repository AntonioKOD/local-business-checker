from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Local Business Website Checker</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 40px;
                color: white;
                min-height: 100vh;
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
            .success {
                background: #51cf66;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
            }
            .form-group {
                margin: 20px 0;
            }
            label {
                display: block;
                margin-bottom: 10px;
                font-weight: 600;
            }
            input, select {
                width: 100%;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                box-sizing: border-box;
            }
            button {
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                width: 100%;
                margin-top: 20px;
            }
            button:hover {
                background: #ff5252;
            }
            .steps {
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔍 Local Business Website Checker</h1>
            
            <div class="success">
                ✅ Server is running successfully on http://localhost:8080!
            </div>
            
            <div class="steps">
                <h3>📋 Next Steps to Enable Full Functionality:</h3>
                <ol>
                    <li><strong>Get Google Maps API Key:</strong>
                        <ul>
                            <li>Visit <a href="https://console.cloud.google.com/" target="_blank" style="color: #ffd700;">Google Cloud Console</a></li>
                            <li>Create a project or select existing one</li>
                            <li>Enable "Places API" and "Geocoding API"</li>
                            <li>Create an API key in "Credentials"</li>
                        </ul>
                    </li>
                    <li><strong>Add API Key:</strong> Edit the .env file in your project folder</li>
                    <li><strong>Run Full App:</strong> Use <code>python3 web_app.py</code></li>
                </ol>
            </div>
            
            <form style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px;">
                <h3>🔍 Search Form Preview</h3>
                <div class="form-group">
                    <label>Business Type:</label>
                    <input type="text" placeholder="e.g., restaurants, dentists, hair salons" disabled>
                </div>
                <div class="form-group">
                    <label>Location:</label>
                    <input type="text" placeholder="e.g., San Francisco, CA" disabled>
                </div>
                <div class="form-group">
                    <label>Search Radius:</label>
                    <select disabled>
                        <option>5 km</option>
                    </select>
                </div>
                <button disabled>🔒 Add API Key to Enable Search</button>
            </form>
            
            <p style="text-align: center; margin-top: 30px; opacity: 0.8;">
                Built with Flask • Powered by Google Places API
            </p>
        </div>
    </body>
    </html>
    '''

@app.route('/health')
def health():
    return {'status': 'OK', 'message': 'Server is running!'}

if __name__ == '__main__':
    print("🚀 Starting Local Business Website Checker...")
    print("🌐 Open your browser and visit: http://localhost:8080")
    print("⚠️  To stop the server, press Ctrl+C")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=8080, debug=True) 
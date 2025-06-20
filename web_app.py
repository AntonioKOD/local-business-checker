from flask import Flask, render_template, request, jsonify, session
import os
import googlemaps
import requests
import stripe
from business_checker import BusinessChecker
from dotenv import load_dotenv
import json
import secrets

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(16))

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
stripe_publishable_key = os.getenv('STRIPE_PUBLISHABLE_KEY')

# Initialize business checker
api_key = os.getenv('GOOGLE_MAPS_API_KEY')
if not api_key or api_key == 'your_google_maps_api_key_here':
    print("Warning: GOOGLE_MAPS_API_KEY not found or not configured in environment variables")
    print("Please add your Google Maps API key to the .env file")
    checker = None
else:
    try:
        checker = BusinessChecker(api_key)
        print("✅ Google Maps API key configured successfully!")
    except Exception as e:
        print(f"❌ Error with Google Maps API key: {e}")
        checker = None

@app.route('/')
def index():
    """Main page with search form."""
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search_businesses():
    """API endpoint to search for businesses and check their websites."""
    if not checker:
        return jsonify({
            'error': 'Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY environment variable.'
        }), 500
    
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        location = data.get('location', '').strip()
        radius = int(data.get('radius', 15000))
        
        if not query or not location:
            return jsonify({
                'error': 'Both query and location are required'
            }), 400
        
        # Analyze businesses
        results = checker.analyze_businesses(query, location, radius)
        
        # Check if user has paid for full access
        has_paid = session.get('has_paid', False)
        
        # Limit results for free users
        if not has_paid:
            limited_results = results[:5]  # Only first 5 for free users
            remaining_count = len(results) - 5
        else:
            limited_results = results
            remaining_count = 0
        
        # Prepare response with statistics
        total_businesses = len(results)
        businesses_with_websites = sum(1 for b in limited_results if b.get('website'))
        accessible_websites = sum(1 for b in limited_results if b.get('website_status', {}).get('accessible'))
        
        response = {
            'businesses': limited_results,
            'statistics': {
                'total_businesses': len(limited_results),
                'businesses_with_websites': businesses_with_websites,
                'accessible_websites': accessible_websites,
                'no_website_count': len(limited_results) - businesses_with_websites,
                'website_percentage': round((businesses_with_websites / len(limited_results) * 100) if len(limited_results) > 0 else 0, 1),
                'accessible_percentage': round((accessible_websites / businesses_with_websites * 100) if businesses_with_websites > 0 else 0, 1)
            },
            'payment_info': {
                'is_free_user': not has_paid,
                'total_found': total_businesses,
                'showing': len(limited_results),
                'remaining': remaining_count,
                'upgrade_price': 6.00
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'error': f'An error occurred: {str(e)}'
        }), 500

@app.route('/check_website', methods=['POST'])
def check_single_website():
    """API endpoint to check a single website status."""
    if not checker:
        return jsonify({
            'error': 'Service not available'
        }), 500
    
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({
                'error': 'URL is required'
            }), 400
        
        result = checker.check_website_status(url)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': f'An error occurred: {str(e)}'
        }), 500

@app.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """Create a Stripe payment intent for upgrading to full access."""
    if not stripe.api_key:
        return jsonify({
            'error': 'Payment processing not configured'
        }), 500
    
    try:
        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=600,  # $6.00 in cents
            currency='usd',
            description='Unlock all business search results',
            metadata={'feature': 'full_search_access'}
        )
        
        return jsonify({
            'client_secret': intent.client_secret,
            'publishable_key': stripe_publishable_key
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Payment error: {str(e)}'
        }), 500

@app.route('/confirm-payment', methods=['POST'])
def confirm_payment():
    """Confirm payment and grant full access."""
    try:
        data = request.get_json()
        payment_intent_id = data.get('payment_intent_id')
        
        if not payment_intent_id:
            return jsonify({
                'error': 'Payment intent ID required'
            }), 400
        
        # Retrieve the payment intent to confirm it was successful
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status == 'succeeded':
            # Grant full access to the user
            session['has_paid'] = True
            session['payment_intent_id'] = payment_intent_id
            
            return jsonify({
                'success': True,
                'message': 'Payment successful! You now have access to all search results.'
            })
        else:
            return jsonify({
                'error': 'Payment was not successful'
            }), 400
            
    except Exception as e:
        return jsonify({
            'error': f'Payment confirmation error: {str(e)}'
        }), 500

@app.route('/payment-status')
def payment_status():
    """Check if user has paid for full access."""
    return jsonify({
        'has_paid': session.get('has_paid', False)
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Page not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    # Get port from environment variable (for deployment platforms)
    port = int(os.environ.get('PORT', 5002))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(debug=debug_mode, host='0.0.0.0', port=port)

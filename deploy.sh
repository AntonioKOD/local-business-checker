#!/bin/bash

# Deployment Helper Script for Local Business Website Checker

echo "🚀 Local Business Website Checker - Deployment Helper"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit"
fi

echo ""
echo "Choose your deployment platform:"
echo "1) Heroku (Recommended for beginners)"
echo "2) Railway (Modern & fast)"
echo "3) Render (Free & reliable)"
echo "4) Manual setup guidance"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔥 HEROKU DEPLOYMENT"
        echo "===================="
        echo ""
        echo "Prerequisites:"
        echo "- Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli"
        echo "- Create Heroku account: https://heroku.com"
        echo ""
        echo "Commands to run:"
        echo ""
        echo "1. Login to Heroku:"
        echo "   heroku login"
        echo ""
        echo "2. Create your app (replace 'your-app-name' with unique name):"
        echo "   heroku create your-app-name"
        echo ""
        echo "3. Set environment variables:"
        echo "   heroku config:set GOOGLE_MAPS_API_KEY=your_actual_key_here"
        echo "   heroku config:set STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key"
        echo "   heroku config:set STRIPE_SECRET_KEY=your_stripe_secret_key"
        echo "   heroku config:set SECRET_KEY=\$(python -c 'import secrets; print(secrets.token_hex(16))')"
        echo ""
        echo "4. Deploy:"
        echo "   git add ."
        echo "   git commit -m 'Deploy to Heroku'"
        echo "   git push heroku main"
        echo ""
        echo "5. Open your app:"
        echo "   heroku open"
        ;;
    2)
        echo ""
        echo "🚄 RAILWAY DEPLOYMENT"
        echo "===================="
        echo ""
        echo "Steps:"
        echo "1. Push your code to GitHub"
        echo "2. Go to https://railway.app"
        echo "3. Sign up and connect your GitHub"
        echo "4. Select your repository"
        echo "5. Add environment variables in Railway dashboard"
        echo "6. Deploy with one click!"
        echo ""
        echo "Your app will be live at: https://your-app.railway.app"
        ;;
    3)
        echo ""
        echo "🎨 RENDER DEPLOYMENT"
        echo "==================="
        echo ""
        echo "Steps:"
        echo "1. Push your code to GitHub"
        echo "2. Go to https://render.com"
        echo "3. Create new Web Service"
        echo "4. Connect your GitHub repository"
        echo "5. Set build command: pip install -r requirements.txt"
        echo "6. Set start command: python web_app.py"
        echo "7. Add environment variables"
        echo "8. Deploy!"
        ;;
    4)
        echo ""
        echo "📚 MANUAL DEPLOYMENT GUIDANCE"
        echo "============================="
        echo ""
        echo "Check out the comprehensive deployment guide:"
        echo "📖 DEPLOYMENT_GUIDE.md"
        echo ""
        echo "It covers:"
        echo "- Multiple deployment platforms"
        echo "- VPS/Cloud server setup"
        echo "- Domain and SSL configuration"
        echo "- Security best practices"
        echo "- Monitoring and analytics"
        echo "- Scaling considerations"
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📋 ENVIRONMENT VARIABLES NEEDED:"
echo "================================"
echo "Make sure you have these ready:"
echo "- GOOGLE_MAPS_API_KEY (from Google Cloud Console)"
echo "- STRIPE_PUBLISHABLE_KEY (from Stripe Dashboard)"
echo "- STRIPE_SECRET_KEY (from Stripe Dashboard)"
echo "- SECRET_KEY (generated automatically)"
echo ""
echo "💡 For detailed setup instructions, see:"
echo "- STRIPE_SETUP.md (for Stripe configuration)"
echo "- DEPLOYMENT_GUIDE.md (for comprehensive deployment guide)"
echo ""
echo "🎉 Good luck with your deployment!" 
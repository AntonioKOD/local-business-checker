# Deployment Guide - Local Business Website Checker

This guide covers multiple deployment options for your Local Business Website Checker app, from simple to advanced.

## 🚀 Quick Deployment Options

### Option 1: Heroku (Recommended for Beginners)
**Pros**: Easy setup, free tier available, automatic scaling
**Cons**: Can be slow to start, limited free hours

#### Steps:
1. **Install Heroku CLI**
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Or download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Heroku app**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Create Procfile**
   ```bash
   echo "web: python web_app.py" > Procfile
   ```

4. **Set environment variables**
   ```bash
   heroku config:set GOOGLE_MAPS_API_KEY=your_actual_key_here
   heroku config:set STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   heroku config:set STRIPE_SECRET_KEY=your_stripe_secret_key
   heroku config:set SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(16))')
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

6. **Update web_app.py for Heroku**
   ```python
   # Change the last line in web_app.py to:
   if __name__ == '__main__':
       port = int(os.environ.get('PORT', 5002))
       app.run(debug=False, host='0.0.0.0', port=port)
   ```

### Option 2: Railway (Modern & Fast)
**Pros**: Very fast, modern interface, generous free tier
**Cons**: Newer platform, fewer tutorials

#### Steps:
1. **Sign up at [railway.app](https://railway.app)**
2. **Connect your GitHub repository**
3. **Deploy with one click**
4. **Set environment variables in Railway dashboard**
5. **Your app will be live at `https://your-app.railway.app`**

### Option 3: Render (Free & Reliable)
**Pros**: Free tier, reliable, good performance
**Cons**: Limited customization on free tier

#### Steps:
1. **Sign up at [render.com](https://render.com)**
2. **Connect GitHub repository**
3. **Create new Web Service**
4. **Set build command**: `pip install -r requirements.txt`
5. **Set start command**: `python web_app.py`
6. **Add environment variables**
7. **Deploy**

### Option 4: DigitalOcean App Platform
**Pros**: Good performance, reasonable pricing, scalable
**Cons**: No free tier, requires payment

#### Steps:
1. **Sign up at [digitalocean.com](https://digitalocean.com)**
2. **Create new App**
3. **Connect GitHub repository**
4. **Configure build settings**
5. **Set environment variables**
6. **Deploy**

## 🔧 Pre-Deployment Checklist

### 1. Update web_app.py for Production
```python
# Add this at the top of web_app.py
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Update the final run command
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
```

### 2. Create runtime.txt (for Heroku)
```bash
echo "python-3.11.0" > runtime.txt
```

### 3. Update requirements.txt
```bash
pip freeze > requirements.txt
```

### 4. Create .gitignore
```bash
# Create .gitignore file
cat > .gitignore << EOF
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
.env
*.log
.DS_Store
EOF
```

### 5. Prepare Environment Variables
Make sure you have these ready:
- `GOOGLE_MAPS_API_KEY`
- `STRIPE_PUBLISHABLE_KEY` 
- `STRIPE_SECRET_KEY`
- `SECRET_KEY`

## 🏗️ Advanced Deployment (VPS/Cloud Server)

### Option 5: AWS EC2 / DigitalOcean Droplet
**Pros**: Full control, scalable, professional
**Cons**: Requires server management knowledge

#### Steps:
1. **Create server instance**
2. **Install dependencies**
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip nginx
   ```

3. **Clone your repository**
   ```bash
   git clone https://github.com/yourusername/local-business-checker.git
   cd local-business-checker
   ```

4. **Install Python dependencies**
   ```bash
   pip3 install -r requirements.txt
   ```

5. **Configure environment variables**
   ```bash
   sudo nano /etc/environment
   # Add your environment variables
   ```

6. **Set up Gunicorn**
   ```bash
   pip3 install gunicorn
   gunicorn --bind 0.0.0.0:5000 web_app:app
   ```

7. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/business-checker
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

8. **Enable site and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/business-checker /etc/nginx/sites-enabled
   sudo systemctl restart nginx
   ```

## 🌐 Domain & SSL Setup

### Custom Domain
1. **Buy domain** from providers like Namecheap, GoDaddy, or Google Domains
2. **Point DNS** to your deployment platform
3. **Configure SSL** (most platforms provide free SSL)

### SSL Certificate (for VPS)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring & Analytics

### Add Error Tracking
```python
# Add to web_app.py
import logging
logging.basicConfig(level=logging.INFO)

# Add error handlers
@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f'Server Error: {error}')
    return jsonify({'error': 'Internal server error'}), 500
```

### Add Analytics
```html
<!-- Add to templates/index.html -->
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 💰 Cost Estimates

### Free Options
- **Heroku**: 550 free hours/month
- **Railway**: $5 credit monthly
- **Render**: Free tier with limitations

### Paid Options
- **Heroku**: $7/month for Hobby plan
- **DigitalOcean**: $12/month for basic droplet
- **AWS EC2**: $3-10/month for t3.micro

## 🔍 Testing Your Deployment

### Pre-Launch Checklist
- [ ] App loads without errors
- [ ] Search functionality works
- [ ] Payment processing works (test mode)
- [ ] All environment variables set
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Analytics tracking active

### Load Testing
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test your app
ab -n 100 -c 10 https://your-app.com/
```

## 🚨 Security Considerations

### Production Security
1. **Use HTTPS only**
2. **Keep dependencies updated**
3. **Set secure session cookies**
4. **Implement rate limiting**
5. **Monitor for suspicious activity**

### Environment Variables Security
- Never commit `.env` files
- Use platform-specific secret management
- Rotate API keys regularly
- Use different keys for staging/production

## 📈 Scaling Considerations

### When to Scale
- Response times > 2 seconds
- High CPU/memory usage
- Payment processing delays
- User complaints about speed

### Scaling Options
1. **Vertical scaling**: Upgrade server resources
2. **Horizontal scaling**: Add more servers
3. **Database optimization**: Add caching
4. **CDN**: Serve static files faster

## 🎯 Recommended Deployment Path

### For Beginners:
1. **Start with Heroku** - Easy setup, good documentation
2. **Add custom domain** - Professional appearance
3. **Enable SSL** - Security and SEO benefits
4. **Add analytics** - Track usage and conversions

### For Experienced Users:
1. **Use Railway or Render** - Better performance
2. **Set up monitoring** - Track errors and performance
3. **Implement caching** - Faster response times
4. **Add load balancing** - Handle more users

### For Production/Business:
1. **Use AWS/DigitalOcean** - Full control and scalability
2. **Set up CI/CD** - Automated deployments
3. **Implement monitoring** - Comprehensive tracking
4. **Add backup systems** - Data protection

## 🆘 Troubleshooting Common Issues

### App Won't Start
- Check environment variables
- Verify Python version compatibility
- Check logs for error messages

### Payment Not Working
- Verify Stripe keys are correct
- Check webhook endpoints
- Test with Stripe test cards

### Slow Performance
- Optimize database queries
- Add caching layer
- Use CDN for static files
- Upgrade server resources

## 📞 Support Resources

- **Platform Documentation**: Each platform has detailed guides
- **Community Forums**: Stack Overflow, Reddit
- **Official Support**: Contact platform support teams
- **Monitoring Tools**: Use tools like Sentry, DataDog

Your app is now ready for deployment! Choose the platform that best fits your needs and budget. 🚀 
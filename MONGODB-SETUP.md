# MongoDB Production Setup Guide

## 🚨 **Current Issue**
Your app is trying to connect to `localhost:27017` instead of a production MongoDB database because the `MONGODB_URL` environment variable is not set correctly.

## 🔧 **Quick Fix Options**

### Option 1: MongoDB Atlas (Recommended)
**Free tier available, fully managed**

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for free account
   - Create a new cluster (M0 Sandbox is free)

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/business-checker?retryWrites=true&w=majority
   ```

3. **Set Environment Variable:**
   ```bash
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/business-checker?retryWrites=true&w=majority
   ```

### Option 2: Railway MongoDB
**If deploying on Railway**

1. **Add MongoDB Service:**
   - In Railway dashboard, click "New"
   - Add "MongoDB" service
   - Railway will auto-generate connection string

2. **Use Railway Variables:**
   ```bash
   MONGODB_URL=${{MongoDB.MONGO_URL}}/business-checker
   ```

### Option 3: Digital Ocean Managed Database
**Professional managed solution**

1. **Create Database:**
   - Go to Digital Ocean
   - Create managed MongoDB database
   - Get connection string

2. **Set Environment Variable:**
   ```bash
   MONGODB_URL=mongodb://username:password@host:port/business-checker?ssl=true
   ```

### Option 4: Self-Hosted MongoDB
**If you have your own server**

1. **Install MongoDB on your server**
2. **Configure security and networking**
3. **Set connection string:**
   ```bash
   MONGODB_URL=mongodb://username:password@your-server-ip:27017/business-checker
   ```

## 🔒 **Security Configuration**

### MongoDB Atlas Security
1. **Network Access:**
   - Add your deployment server IP to whitelist
   - Or use `0.0.0.0/0` for all IPs (less secure)

2. **Database User:**
   - Create dedicated user for your app
   - Give read/write permissions to your database

3. **Connection String Format:**
   ```
   mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
   ```

## 🚀 **Deployment Platform Specific Instructions**

### Vercel
```bash
# In Vercel dashboard or CLI
vercel env add MONGODB_URL
# Paste your MongoDB connection string
```

### Netlify
```bash
# In Netlify dashboard
# Go to Site settings > Environment variables
# Add MONGODB_URL with your connection string
```

### Railway
```bash
# Railway automatically provides MongoDB if you add the service
# Use: ${{MongoDB.MONGO_URL}}/business-checker
```

### Docker/VPS
```bash
# In your .env file or environment
export MONGODB_URL="mongodb+srv://username:password@cluster.mongodb.net/business-checker"
```

## 🧪 **Testing the Connection**

### Test Script
Create a test file to verify connection:

```javascript
// test-db.js
const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL || 'your-connection-string-here';

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('✅ MongoDB connected successfully!');
    
    // Test basic operations
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Database write test successful!');
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed!');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

testConnection();
```

Run with: `node test-db.js`

## 🔧 **Environment Variable Setup**

### Required Environment Variables
```bash
# MongoDB (REQUIRED)
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/business-checker

# PayloadCMS (REQUIRED)
PAYLOAD_SECRET=your-super-secret-payload-key-here

# JWT (REQUIRED)
JWT_SECRET=your-jwt-secret-key-here

# App URL (REQUIRED)
NEXT_PUBLIC_APP_URL=https://buildquick.io

# Production Mode
NODE_ENV=production
```

## 🚨 **Common Issues & Solutions**

### Issue 1: "Authentication failed"
**Solution:** Check username/password in connection string

### Issue 2: "Network timeout"
**Solution:** Check IP whitelist in MongoDB Atlas

### Issue 3: "Database not found"
**Solution:** MongoDB will create database automatically on first write

### Issue 4: "SSL connection error"
**Solution:** Ensure SSL is enabled in connection string

## ✅ **Verification Checklist**

After setting up MongoDB:
- [ ] Connection string is correct
- [ ] Username and password are correct
- [ ] IP address is whitelisted (if using Atlas)
- [ ] Environment variable is set in deployment platform
- [ ] Database name is included in connection string
- [ ] SSL/TLS is properly configured

## 🎯 **Next Steps**

1. **Choose your MongoDB option** (Atlas recommended for beginners)
2. **Set the MONGODB_URL environment variable** in your deployment platform
3. **Redeploy your application**
4. **Test the connection** using the admin panel at `https://buildquick.io/admin`

Your app should now connect to the production database successfully! 🚀 
#!/bin/bash

echo "Clearing all caches and restarting the application..."

# Kill any running Next.js processes
pkill -f "next dev" || true
pkill -f "next start" || true

# Clear Next.js cache
rm -rf .next

# Clear node_modules cache (optional, but can help)
# rm -rf node_modules
# npm install

# Clear browser cache instructions
echo ""
echo "Please also clear your browser cache:"
echo "1. Open your browser"
echo "2. Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo "3. Select 'All time' for time range"
echo "4. Check 'Cached images and files'"
echo "5. Click 'Clear data'"
echo ""

# Start the development server
echo "Starting development server..."
npm run dev 
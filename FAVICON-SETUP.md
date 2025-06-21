# Favicon Setup Instructions

To complete the SEO setup, you need to add the following favicon files to the `public/` directory:

## Required Files

1. **favicon.ico** (16x16, 32x32, 48x48 pixels)
2. **favicon-16x16.png** (16x16 pixels)
3. **favicon-32x32.png** (32x32 pixels)
4. **apple-touch-icon.png** (180x180 pixels)
5. **android-chrome-192x192.png** (192x192 pixels)
6. **android-chrome-512x512.png** (512x512 pixels)
7. **og-image.png** (1200x630 pixels for social media sharing)

## Quick Setup

You can generate all these files from a single high-resolution logo (512x512 or larger) using:

### Option 1: Online Generator
- Visit [RealFaviconGenerator.net](https://realfavicongenerator.net/)
- Upload your logo
- Download the generated files
- Place them in the `public/` directory

### Option 2: Manual Creation
Create a simple icon with the letters "BC" (BusinessChecker) in a blue circle:
- Background: Blue (#2563eb)
- Text: White "BC"
- Font: Bold, sans-serif

## Files Already Referenced

The following files are already referenced in the app metadata:
- `/favicon.ico` - Main favicon
- `/favicon-16x16.png` - Small favicon
- `/favicon-32x32.png` - Medium favicon  
- `/apple-touch-icon.png` - iOS home screen icon
- `/android-chrome-192x192.png` - Android icon
- `/android-chrome-512x512.png` - Large Android icon
- `/og-image.png` - Social media preview image

## Social Media Image (og-image.png)

Create a 1200x630 pixel image with:
- Background: Gradient from blue to indigo
- Text: "BusinessChecker"
- Subtitle: "Local Business Finder & Website Analyzer"
- Logo/Icon: Business-related icon

This image will appear when someone shares your site on social media platforms. 
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Client Compass - Local Business Finder & Website Analyzer',
    short_name: 'Client Compass',
    description: 'Discover local businesses and get comprehensive website analysis. Perfect for lead generation and market research.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/Client_Compass.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/Client_Compass.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['business', 'productivity', 'utilities'],
    lang: 'en',
    dir: 'ltr',
    orientation: 'portrait-primary',
  }
} 
import React from 'react'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'BusinessChecker - Find Local Businesses & Analyze Their Websites',
    template: '%s | BusinessChecker'
  },
  description: 'Discover local businesses and get comprehensive website analysis. Find businesses without websites, check website accessibility, and get detailed analytics. Perfect for lead generation and market research.',
  keywords: [
    'local business finder',
    'website analysis',
    'business directory',
    'lead generation',
    'market research',
    'website checker',
    'business search',
    'local SEO',
    'competitor analysis',
    'business analytics'
  ],
  authors: [{ name: 'BusinessChecker' }],
  creator: 'BusinessChecker',
  publisher: 'BusinessChecker',
  metadataBase: new URL('https://buildquick.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://buildquick.io',
    title: 'BusinessChecker - Find Local Businesses & Analyze Their Websites',
    description: 'Discover local businesses and get comprehensive website analysis. Find businesses without websites, check website accessibility, and get detailed analytics.',
    siteName: 'BusinessChecker',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BusinessChecker - Local Business Finder & Website Analyzer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BusinessChecker - Find Local Businesses & Analyze Their Websites',
    description: 'Discover local businesses and get comprehensive website analysis. Perfect for lead generation and market research.',
    images: ['/og-image.png'],
    creator: '@businesschecker',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}

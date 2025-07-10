import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
const Wappalyzer = require('wappalyzer') as any;

const options = {
  debug: false,
  delay: 500,
  maxDepth: 3,
  maxUrls: 10,
  maxWait: 10000,
  recursive: true,
  userAgent: 'BusinessChecker/1.0',
  htmlMaxCols: 2000,
  htmlMaxRows: 2000,
};

// Simple in-memory cache for API results
const analysisCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache

async function getPageSpeedInsights(url: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.log('Google API Key not found, skipping PageSpeed Insights.');
    return null;
  }
  
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=PERFORMANCE&category=ACCESSIBILITY&category=SEO`;
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error(`PageSpeed API error: ${response.status}`);
      return null;
    }
    const data = await response.json();
    
    return {
      performance: data.lighthouseResult.categories.performance.score * 100,
      accessibility: data.lighthouseResult.categories.accessibility.score * 100,
      seo: data.lighthouseResult.categories.seo.score * 100,
      lcp: data.lighthouseResult.audits['largest-contentful-paint'].displayValue,
      cls: data.lighthouseResult.audits['cumulative-layout-shift'].displayValue,
    };
  } catch (error) {
    console.error('Error fetching PageSpeed Insights:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const { url, userId } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Simplified premium check
  if (!userId) {
    return NextResponse.json({ error: 'Authentication is required for this feature.' }, { status: 401 });
  }

  // Check cache first
  const cached = analysisCache.get(url);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION_MS) {
    return NextResponse.json(cached.data);
  }

  const wappalyzer = new Wappalyzer(options);

  try {
    await wappalyzer.init();

    const site = await wappalyzer.open(url);
    const techAnalysis = await site.analyze();
    
    const pageSpeedData = await getPageSpeedInsights(url);

    const result = {
      technologies: techAnalysis.technologies,
      performance: pageSpeedData
    };

    // Cache the result
    analysisCache.set(url, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze website.' }, { status: 500 });
  } finally {
    await wappalyzer.destroy();
  }
} 
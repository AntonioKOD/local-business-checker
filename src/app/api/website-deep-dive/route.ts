import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

interface WebsiteData {
  title: string;
  metaDescription: string;
  textLength: number;
  technologies: string[];
  forms: Array<{
    action: string;
    method: string;
    inputs: number;
  }>;
  socialLinks: string[];
  hasContactForm: boolean;
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Basic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    try {
      // Navigate to the website
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Extract basic information
      const websiteData: WebsiteData = await page.evaluate(() => {
        // Get page title
        const title = document.title;
        
        // Get meta description
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        // Get all text content
        const textContent = document.body.innerText;
        
        // Simple technology detection based on common patterns
        const technologies = [];
        
        // Check for common frameworks/libraries
        if (window.React || document.querySelector('[data-reactroot]')) {
          technologies.push('React');
        }
        if (window.Vue) {
          technologies.push('Vue.js');
        }
        if (window.jQuery || window.$) {
          technologies.push('jQuery');
        }
        if (window.angular) {
          technologies.push('AngularJS');
        }
        if (document.querySelector('meta[name="generator"]')?.getAttribute('content')?.includes('WordPress')) {
          technologies.push('WordPress');
        }
        if (document.querySelector('script[src*="shopify"]')) {
          technologies.push('Shopify');
        }
        if (document.querySelector('script[src*="wix"]')) {
          technologies.push('Wix');
        }
        if (document.querySelector('script[src*="squarespace"]')) {
          technologies.push('Squarespace');
        }

        // Get forms
        const forms = Array.from(document.querySelectorAll('form')).map(form => ({
          action: form.action,
          method: form.method,
          inputs: form.querySelectorAll('input').length
        }));

        // Get social media links
        const socialLinks = Array.from(document.querySelectorAll('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"], a[href*="youtube"]'))
          .map(link => (link as HTMLAnchorElement).href);

        return {
          title,
          metaDescription,
          textLength: textContent.length,
          technologies,
          forms,
          socialLinks,
          hasContactForm: forms.some(form => 
            form.action.includes('contact') || 
            Array.from(document.querySelectorAll('input')).some(input => 
              input.type === 'email' || input.name.includes('email')
            )
          )
        };
      });

      await browser.close();

      // Simple analysis
      const analysis = {
        url,
        title: websiteData.title,
        description: websiteData.metaDescription,
        technologies: websiteData.technologies,
        hasContactForm: websiteData.hasContactForm,
        socialMediaPresence: websiteData.socialLinks.length > 0,
        contentLength: websiteData.textLength,
        leadQuality: calculateLeadQuality(websiteData)
      };

      return NextResponse.json(analysis);

    } catch (pageError) {
      await browser.close();
      console.error('Page navigation error:', pageError);
      return NextResponse.json(
        { error: 'Failed to analyze website' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Website analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateLeadQuality(data: WebsiteData): number {
  let score = 50; // Base score

  // Has contact form
  if (data.hasContactForm) score += 20;
  
  // Has social media presence
  if (data.socialLinks.length > 0) score += 10;
  
  // Content quality (basic check)
  if (data.textLength > 1000) score += 10;
  if (data.textLength > 3000) score += 5;
  
  // Modern technologies
  if (data.technologies.length > 0) score += 5;
  
  return Math.min(100, Math.max(0, score));
} 
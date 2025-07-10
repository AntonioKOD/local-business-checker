import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { url, data, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!url || !data) {
      return NextResponse.json({ error: 'URL and report data are required' }, { status: 400 });
    }

    // Create HTML template directly
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Website Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .header h1 { color: #1e293b; margin: 0; font-size: 28px; }
            .header p { color: #64748b; margin: 10px 0 0 0; font-size: 16px; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #334155; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #3b82f6; padding-left: 15px; }
            .metric { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f1f5f9; border-radius: 6px; margin-bottom: 8px; }
            .metric-label { font-weight: 500; color: #475569; }
            .metric-value { font-weight: 700; color: #1e293b; }
            .score { font-size: 24px; font-weight: bold; text-align: center; padding: 15px; border-radius: 8px; }
            .score.good { background: #dcfce7; color: #166534; }
            .score.fair { background: #fef3c7; color: #92400e; }
            .score.poor { background: #fee2e2; color: #991b1b; }
            .tech-stack { display: flex; flex-wrap: wrap; gap: 8px; }
            .tech-item { background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
            .issues { list-style: none; padding: 0; }
            .issues li { background: #fef2f2; color: #991b1b; padding: 8px 12px; margin-bottom: 5px; border-radius: 4px; border-left: 3px solid #ef4444; }
            .recommendations { list-style: none; padding: 0; }
            .recommendations li { background: #f0fdf4; color: #166534; padding: 8px 12px; margin-bottom: 5px; border-radius: 4px; border-left: 3px solid #22c55e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Website Analysis Report</h1>
              <p>${url}</p>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <h2>Overall Performance</h2>
              <div class="score ${data.overall_score >= 80 ? 'good' : data.overall_score >= 60 ? 'fair' : 'poor'}">
                ${data.overall_score}/100
              </div>
            </div>
            
            <div class="section">
              <h2>Performance Metrics</h2>
              <div class="metric">
                <span class="metric-label">Performance Score</span>
                <span class="metric-value">${data.performance_score}/100</span>
              </div>
              <div class="metric">
                <span class="metric-label">SEO Score</span>
                <span class="metric-value">${data.seo_score}/100</span>
              </div>
              <div class="metric">
                <span class="metric-label">Accessibility Score</span>
                <span class="metric-value">${data.accessibility_score}/100</span>
              </div>
              <div class="metric">
                <span class="metric-label">Best Practices Score</span>
                <span class="metric-value">${data.best_practices_score}/100</span>
              </div>
            </div>
            
            ${data.technologies && data.technologies.length > 0 ? `
            <div class="section">
              <h2>Technology Stack</h2>
              <div class="tech-stack">
                ${data.technologies.map((tech: { name: string }) => `<span class="tech-item">${tech.name}</span>`).join('')}
              </div>
            </div>
            ` : ''}
            
            ${data.issues && data.issues.length > 0 ? `
            <div class="section">
              <h2>Issues Found</h2>
              <ul class="issues">
                ${data.issues.map((issue: string) => `<li>${issue}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            ${data.recommendations && data.recommendations.length > 0 ? `
            <div class="section">
              <h2>Recommendations</h2>
              <ul class="recommendations">
                ${data.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set a modern viewport
    await page.setViewport({ width: 1080, height: 1024 });

    // Set page content
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${new URL(url).hostname}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF report.' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { BusinessChecker } from '@/lib/business-checker';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service not available' },
        { status: 500 }
      );
    }

    const checker = new BusinessChecker();
    const result = await checker.checkWebsiteStatus(url);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Website check error:', error);
    return NextResponse.json(
      { error: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 
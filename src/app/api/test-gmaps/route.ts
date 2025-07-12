import { NextRequest, NextResponse } from 'next/server';
import { FreeClientCompass } from '@/lib/business-checker-free';

export async function GET(request: NextRequest) {
  try {
    const checker = new FreeClientCompass();
    
    console.log('🧪 Testing GMaps Extractor API connection...');
    
    const isConnected = await checker.testAPIConnection();
    
    if (isConnected) {
      return NextResponse.json({ 
        success: true, 
        message: 'GMaps Extractor API connection successful' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'GMaps Extractor API connection failed' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Test API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
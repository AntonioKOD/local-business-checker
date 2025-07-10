import { NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in seconds
  limit: number;    // Maximum requests per interval
}

interface RateLimitRecord {
  count: number;
  timestamp: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  interval: 60,     // 1 minute
  limit: 60         // 60 requests per minute
};

const STRICT_CONFIG: RateLimitConfig = {
  interval: 60,     // 1 minute
  limit: 10         // 10 requests per minute
};

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Math.floor(Date.now() / 1000);
    for (const [key, record] of rateLimitStore.entries()) {
      if (now - record.timestamp >= 300) { // Remove entries older than 5 minutes
        rateLimitStore.delete(key);
      }
    }
  }, 300000); // 5 minutes
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const now = Math.floor(Date.now() / 1000);
  const key = `rate_limit:${identifier}`;
  
  try {
    // Get the current count and timestamp
    const data = rateLimitStore.get(key);
    const currentTimestamp = now;
    
    if (!data) {
      // First request, initialize counter
      rateLimitStore.set(key, { count: 1, timestamp: currentTimestamp });
      return {
        success: true,
        remaining: config.limit - 1,
        reset: currentTimestamp + config.interval
      };
    }

    // Check if the time window has expired
    if (currentTimestamp - data.timestamp >= config.interval) {
      // Reset counter for new window
      rateLimitStore.set(key, { count: 1, timestamp: currentTimestamp });
      return {
        success: true,
        remaining: config.limit - 1,
        reset: currentTimestamp + config.interval
      };
    }

    // Check if limit is exceeded
    if (data.count >= config.limit) {
      return {
        success: false,
        remaining: 0,
        reset: data.timestamp + config.interval
      };
    }

    // Increment counter
    const newCount = data.count + 1;
    rateLimitStore.set(key, { count: newCount, timestamp: data.timestamp });
    
    return {
      success: true,
      remaining: config.limit - newCount,
      reset: data.timestamp + config.interval
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open - allow request in case of error
    return {
      success: true,
      remaining: 1,
      reset: now + config.interval
    };
  }
}

export async function rateLimitMiddleware(
  request: Request,
  config: RateLimitConfig = DEFAULT_CONFIG
) {
  // Extract IP from request headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0] || 'unknown';
  const identifier = `${request.method}:${new URL(request.url).pathname}:${ip}`;
  
  const result = await rateLimit(identifier, config);
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': (result.reset - Math.floor(Date.now() / 1000)).toString()
        }
      }
    );
  }
  
  return null;
}

// Export configs for different rate limit needs
export const rateLimitConfigs = {
  DEFAULT: DEFAULT_CONFIG,
  STRICT: STRICT_CONFIG,
  // Add more configurations as needed
  AUTH: {
    interval: 300,  // 5 minutes
    limit: 20       // 20 requests per 5 minutes
  },
  PAYMENT: {
    interval: 3600, // 1 hour
    limit: 10       // 10 payment attempts per hour
  }
}; 
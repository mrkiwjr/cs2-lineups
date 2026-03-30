import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

function createLimiter(requests: number, window: Parameters<typeof Ratelimit.slidingWindow>[1], prefix: string) {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix,
  })
}

export const generalLimiter = createLimiter(60, '1 m', 'rl:general')
export const writeLimiter = createLimiter(20, '1 m', 'rl:write')
export const uploadLimiter = createLimiter(10, '1 m', 'rl:upload')

export function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<Response | null> {
  if (!limiter) return null

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    if (!success) {
      return Response.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        },
      )
    }
    return null
  } catch (err) {
    console.warn('[rate-limit] Upstash unavailable, allowing request:', err)
    return null
  }
}

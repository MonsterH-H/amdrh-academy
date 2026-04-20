/**
 * In-Memory Rate Limiter
 *
 * Provides per-IP and per-user rate limiting with configurable windows and max requests.
 * Uses a sliding window approach with automatic cleanup of expired entries.
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Number of requests remaining in the current window */
  remaining: number;
  /** Time in milliseconds until the rate limit resets */
  resetMs: number;
  /** Total limit for the current window */
  limit: number;
}

// In-memory store: key → { timestamps[] }
const store = new Map<string, RateLimitEntry>();

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Remove expired timestamps from all entries and delete empty entries
 */
function cleanup(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    // Remove timestamps older than 1 hour (safe cleanup window)
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < 3600 * 1000);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

/**
 * Ensure cleanup timer is running
 */
function ensureCleanup(): void {
  if (!cleanupTimer) {
    cleanupTimer = setInterval(cleanup, CLEANUP_INTERVAL);
    // Allow process to exit without waiting for timer
    if (cleanupTimer.unref) {
      cleanupTimer.unref();
    }
  }
}

/**
 * Check rate limit for a given key
 */
function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  ensureCleanup();

  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Filter out timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  const remaining = Math.max(0, config.maxRequests - entry.timestamps.length);

  if (entry.timestamps.length >= config.maxRequests) {
    // Find when the oldest timestamp in the window will expire
    const oldestInWindow = entry.timestamps[0];
    const resetMs = oldestInWindow + config.windowMs - now;

    return {
      success: false,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
      limit: config.maxRequests,
    };
  }

  // Add the current request timestamp
  entry.timestamps.push(now);

  return {
    success: true,
    remaining: remaining - 1,
    resetMs: config.windowMs,
    limit: config.maxRequests,
  };
}

/**
 * Rate limit by IP address
 */
export function rateLimitByIP(
  ip: string,
  config: RateLimitConfig
): RateLimitResult {
  return checkRateLimit(`ip:${ip}`, config);
}

/**
 * Rate limit by user ID
 */
export function rateLimitByUser(
  userId: string,
  config: RateLimitConfig
): RateLimitResult {
  return checkRateLimit(`user:${userId}`, config);
}

/**
 * Rate limit by a custom key (e.g., "ip:userId" for combined limiting)
 */
export function rateLimitByKey(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  return checkRateLimit(key, config);
}

/**
 * Extract client IP from request headers
 */
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }

  // Fallback to a generic identifier
  return "unknown";
}

/**
 * Create a rate limit check function for use in API routes.
 * Returns a function that can be called with a NextRequest.
 *
 * Usage in an API route:
 * ```ts
 * import { createRateLimiter } from "@/lib/rate-limit";
 *
 * const authLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
 *
 * export async function POST(req: NextRequest) {
 *   const { success, remaining, resetMs } = authLimiter(req);
 *   if (!success) {
 *     return NextResponse.json(
 *       { error: "Trop de requêtes", retryAfter: Math.ceil(resetMs / 1000) },
 *       {
 *         status: 429,
 *         headers: {
 *           "Retry-After": String(Math.ceil(resetMs / 1000)),
 *           "X-RateLimit-Remaining": "0",
 *           "X-RateLimit-Reset": String(Math.ceil(resetMs / 1000)),
 *         },
 *       }
 *     );
 *   }
 *   // ... handle request
 * }
 * ```
 */
export function createRateLimiter(
  config: RateLimitConfig,
  type: "ip" | "user" | "key" = "ip"
): (
  request: Request,
  userId?: string
) => RateLimitResult & { headers: Record<string, string> } {
  return (request: Request, userId?: string) => {
    let key: string;
    if (type === "user" && userId) {
      key = `user:${userId}`;
    } else if (type === "key" && userId) {
      key = userId; // Custom key passed as userId param
    } else {
      key = `ip:${getClientIP(request)}`;
    }

    const result = checkRateLimit(key, config);

    return {
      ...result,
      headers: {
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetMs / 1000)),
        ...(result.success
          ? {}
          : { "Retry-After": String(Math.ceil(result.resetMs / 1000)) }),
      },
    };
  };
}

/**
 * Reset rate limit for a specific key (useful for testing or admin actions)
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Get current store size (useful for monitoring)
 */
export function getStoreSize(): number {
  return store.size;
}

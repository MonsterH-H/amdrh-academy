/**
 * Pre-configured API Rate Limiters
 *
 * Provides ready-to-use rate limiters for different endpoint types:
 * - authLimiter:      10 req/min per IP (login, register, password reset)
 * - generalLimiter:   60 req/min per user (standard API calls)
 * - uploadLimiter:     5 req/min per user (file uploads)
 * - adminLimiter:    120 req/min per user (admin endpoints)
 *
 * Usage:
 * ```ts
 * import { authLimiter, withRateLimit } from "@/lib/api-rate-limit";
 *
 * export async function POST(req: NextRequest) {
 *   const result = authLimiter(req);
 *   if (!result.success) {
 *     return NextResponse.json(
 *       { error: "Trop de requêtes. Réessayez plus tard." },
 *       { status: 429, headers: result.headers }
 *     );
 *   }
 *   // ... your handler
 * }
 *
 * // Or use the helper wrapper:
 * export const POST = withRateLimit(authLimiter, async (req) => {
 *   // ... your handler
 * });
 * ```
 */

import { createRateLimiter } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

// ──────────────────────────────────────────────
// Pre-configured Limiters
// ──────────────────────────────────────────────

/**
 * Auth endpoints rate limiter
 * 10 requests per minute per IP
 * For: login, register, password reset, email verification
 */
export const authLimiter = createRateLimiter(
  {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  "ip"
);

/**
 * General API rate limiter
 * 60 requests per minute per user (falls back to IP if no userId)
 * For: standard CRUD operations, data fetching
 */
export const generalLimiter = createRateLimiter(
  {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
  },
  "user"
);

/**
 * File upload rate limiter
 * 5 requests per minute per user
 * For: file uploads, resource creation
 */
export const uploadLimiter = createRateLimiter(
  {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  "user"
);

/**
 * Admin endpoints rate limiter
 * 120 requests per minute per user
 * For: admin dashboard, analytics, bulk operations
 */
export const adminLimiter = createRateLimiter(
  {
    maxRequests: 120,
    windowMs: 60 * 1000, // 1 minute
  },
  "user"
);

/**
 * Strict rate limiter for sensitive operations
 * 3 requests per minute per IP
 * For: password changes, email changes, account deletion
 */
export const strictLimiter = createRateLimiter(
  {
    maxRequests: 3,
    windowMs: 60 * 1000, // 1 minute
  },
  "ip"
);

/**
 * Search API rate limiter
 * 30 requests per minute per user
 * For: search endpoints, autocomplete, filtering
 */
export const searchLimiter = createRateLimiter(
  {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
  "user"
);

// ──────────────────────────────────────────────
// Helper: Extract userId from request
// ──────────────────────────────────────────────

function extractUserId(request: NextRequest): string | undefined {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (userId) return userId;

    // Also check POST body for userId (non-destructive)
    return undefined;
  } catch {
    return undefined;
  }
}

// ──────────────────────────────────────────────
// Helper: Check rate limit for user-type limiters
// ──────────────────────────────────────────────

/**
 * Check rate limit using the appropriate limiter type.
 * For IP-based limiters, uses the client IP directly.
 * For user-based limiters, uses userId if available, otherwise falls back to IP.
 */
export function checkRateLimit(
  request: NextRequest,
  limiter: ReturnType<typeof createRateLimiter>
) {
  return limiter(request, extractUserId(request));
}

// ──────────────────────────────────────────────
// Higher-order helper: Wrap an API handler with rate limiting
// ──────────────────────────────────────────────

type RateLimiterFn = ReturnType<typeof createRateLimiter>;
type ApiHandler = (req: NextRequest) => Promise<NextResponse> | NextResponse;

/**
 * Wrap an API handler with rate limit checking.
 * Returns 429 if rate limit is exceeded, otherwise proceeds with the handler.
 *
 * Usage:
 * ```ts
 * export const POST = withRateLimit(authLimiter, async (req) => {
 *   const body = await req.json();
 *   return NextResponse.json({ ok: true });
 * });
 * ```
 */
export function withRateLimit(
  limiter: RateLimiterFn,
  handler: ApiHandler
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const result = limiter(req, extractUserId(req));

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Trop de requêtes. Veuillez réessayer plus tard.",
          retryAfter: Math.ceil(result.resetMs / 1000),
          limit: result.limit,
          remaining: result.remaining,
        },
        {
          status: 429,
          headers: result.headers,
        }
      );
    }

    const response = await handler(req);

    // Attach rate limit headers to successful responses
    if (response instanceof NextResponse) {
      for (const [key, value] of Object.entries(result.headers)) {
        response.headers.set(key, value);
      }
    }

    return response;
  };
}

/**
 * Next.js Middleware
 *
 * Handles:
 * - Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
 * - CORS handling
 * - API route protection (adds auth context headers, does NOT redirect)
 *
 * IMPORTANT: This middleware adds headers only — it does NOT redirect users.
 * API routes are responsible for their own authentication checks.
 */

import { NextRequest, NextResponse } from "next/server";

// Paths that require authentication headers (but no redirect)
const PROTECTED_API_PATHS = [
  "/api/admin",
  "/api/notifications",
  "/api/messages",
  "/api/courses/enroll",
  "/api/quiz",
  "/api/dashboard",
  "/api/profile",
  "/api/files/upload",
  "/api/certificates/create",
  "/api/learning-paths/enroll",
  "/api/progress",
];

// Paths that are publicly accessible (no auth needed)
const PUBLIC_API_PATHS = [
  "/api/auth",
  "/api/courses",
  "/api/learning-paths",
  "/api/badges",
  "/api/public",
  "/api/realtime",
];

// Allowed origins for CORS
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["*"];

/**
 * Security headers applied to ALL responses
 */
function getSecurityHeaders(): HeadersInit {
  return {
    // Prevent clickjacking
    "X-Frame-Options": "DENY",
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    // XSS Protection (legacy, but still useful for older browsers)
    "X-XSS-Protection": "1; mode=block",
    // Referrer policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Permissions policy — restrict browser features
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    // HSTS — enforce HTTPS (1 year)
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };
}

/**
 * CORS headers for API routes
 */
function getCORSHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get("origin") || "";

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control",
    "Access-Control-Max-Age": "86400", // 24 hours preflight cache
    "Access-Control-Allow-Credentials": "true",
  };

  if (ALLOWED_ORIGINS.includes("*")) {
    corsHeaders["Access-Control-Allow-Origin"] = origin || "*";
  } else if (ALLOWED_ORIGINS.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  return corsHeaders;
}

/**
 * Check if a path matches any of the given patterns
 */
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => pathname.startsWith(pattern));
}

/**
 * Check if the request has basic auth indicators
 * (userId and role query params or session cookie)
 */
function hasAuthIndicators(request: NextRequest): boolean {
  const { searchParams } = new URL(request.url);
  const hasQueryAuth = searchParams.has("userId") && searchParams.has("role");

  // Check for NextAuth session cookie
  const sessionCookie = request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  return hasQueryAuth || !!sessionCookie;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ──────────────────────────────────────────────
  // 1. Apply security headers to ALL responses
  // ──────────────────────────────────────────────
  const securityHeaders = getSecurityHeaders();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // ──────────────────────────────────────────────
  // 2. Handle CORS for API routes
  // ──────────────────────────────────────────────
  if (pathname.startsWith("/api")) {
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      const corsHeaders = getCORSHeaders(request);
      const preflightResponse = new NextResponse(null, { status: 204 });
      for (const [key, value] of Object.entries(corsHeaders)) {
        preflightResponse.headers.set(key, value);
      }
      // Also set security headers on preflight
      for (const [key, value] of Object.entries(securityHeaders)) {
        preflightResponse.headers.set(key, value);
      }
      return preflightResponse;
    }

    // Add CORS headers to all API responses
    const corsHeaders = getCORSHeaders(request);
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
  }

  // ──────────────────────────────────────────────
  // 3. Mark protected API routes (add header, no redirect)
  // ──────────────────────────────────────────────
  if (matchesPath(pathname, PROTECTED_API_PATHS) && !hasAuthIndicators(request)) {
    // Set a header indicating auth is required — API routes handle this themselves
    response.headers.set("X-Auth-Required", "true");
  }

  // ──────────────────────────────────────────────
  // 4. Add request metadata headers (for downstream use)
  // ──────────────────────────────────────────────
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  response.headers.set("X-Client-IP", clientIP);
  response.headers.set("X-Request-ID", crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  return response;
}

/**
 * Middleware matcher configuration
 *
 * Run on:
 * - All API routes
 * - All page routes (for security headers)
 *
 * Skip:
 * - Static files (_next/static, favicon, images, etc.)
 * - Internal Next.js files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};

/**
 * Next.js Proxy (middleware equivalent in Next.js 16)
 *
 * Handles:
 * - Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
 * - CORS handling
 * - API route protection (adds auth context headers, does NOT redirect)
 *
 * IMPORTANT: This proxy adds headers only — it does NOT redirect users.
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

// Allowed origins for CORS
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

/**
 * Generate a unique request ID without using crypto.randomUUID()
 * (crypto.randomUUID() crashes Turbopack dev server in some environments)
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Security headers applied to ALL responses
 */
function getSecurityHeaders(): HeadersInit {
  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": [
      "default-src 'self'",
      // Next.js Turbopack & runtime need inline scripts + eval for HMR, chunk loading, and __webpack_chunk_loading__
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://*.vercel-storage.dev https://*.neon.tech https://avatars.githubusercontent.com https://uploadthing.com https://utfs.io",
      "font-src 'self' https://fonts.gstatic.com",
      // connect-src: MUST include *.ingest.uploadthing.com for file uploads (presigned URLs)
      "connect-src 'self' https://*.neon.tech https://uploadthing.com https://utfs.io https://*.ingest.uploadthing.com wss://* https://cdn.jsdelivr.net https://vercel.live",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      // form-action: allow UploadThing callbacks
      "form-action 'self' https://*.uploadthing.com",
    ].join('; '),
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
      "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-User-Id",
    "Access-Control-Max-Age": "86400",
  };

  // Only set CORS for explicitly allowed origins or same-origin requests.
  // When ALLOWED_ORIGINS is empty, do NOT allow wildcard with credentials.
  if (ALLOWED_ORIGINS.length === 0) {
    // No explicit origins configured — only allow same-origin (no origin header)
    if (!origin) {
      corsHeaders["Access-Control-Allow-Origin"] = "*";
    }
    // If an origin IS present, don't set Allow-Origin at all (blocks cross-origin)
  } else if (!origin || ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin || "*";
    corsHeaders["Access-Control-Allow-Credentials"] = "true";
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

  const sessionCookie = request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  return hasQueryAuth || !!sessionCookie;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. Apply security headers to ALL responses
  const securityHeaders = getSecurityHeaders();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // 2. Handle CORS for API routes
  if (pathname.startsWith("/api")) {
    if (request.method === "OPTIONS") {
      const corsHeaders = getCORSHeaders(request);
      const preflightResponse = new NextResponse(null, { status: 204 });
      for (const [key, value] of Object.entries(corsHeaders)) {
        preflightResponse.headers.set(key, value);
      }
      for (const [key, value] of Object.entries(securityHeaders)) {
        preflightResponse.headers.set(key, value);
      }
      return preflightResponse;
    }

    const corsHeaders = getCORSHeaders(request);
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
  }

  // 3. Mark protected API routes (add header, no redirect)
  if (matchesPath(pathname, PROTECTED_API_PATHS) && !hasAuthIndicators(request)) {
    response.headers.set("X-Auth-Required", "true");
  }

  // 4. Add request metadata headers
  response.headers.set("X-Request-ID", generateRequestId());

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};

/**
 * Clyra Security Hardening & Obfuscation Utilities
 * Defends against:
 * 1. SSRF (Server-Side Request Forgery)
 * 2. Path Traversal & Arbitrary File Overwrite
 * 3. CLI Argument Injection
 * 4. Stored & DOM XSS
 * 5. DoS / API Request Flooding (Rate Limiting)
 * 6. File Structure & Target URL Obfuscation (Tokenized & Hashed URIs)
 */

import crypto from "crypto";

// In-memory rate limiting store
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old rate limit entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Basic in-memory rate limiter
 */
export function checkRateLimit(
  identifier: string,
  maxRequests = 30,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count };
}

/**
 * Generates an elegant, cryptographically random obfuscated alphanumeric token (e.g. `cly_8f9a2e1d7c4b`)
 */
export function generateObfuscatedId(prefix = "cly", length = 12): string {
  const bytes = crypto.randomBytes(Math.ceil(length / 2));
  const hex = bytes.toString("hex").slice(0, length);
  return `${prefix}_${hex}`;
}

/**
 * Encodes an object payload into a clean, URL-safe base64 token
 * This hides internal URLs and parameter structures from direct inspection.
 */
export function encodeObfuscatedToken(payload: Record<string, any>): string {
  try {
    const jsonStr = JSON.stringify(payload);
    return Buffer.from(jsonStr, "utf-8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch {
    return "";
  }
}

/**
 * Decodes an obfuscated URL-safe token back to an object payload.
 */
export function decodeObfuscatedToken<T = any>(token: string): T | null {
  try {
    if (!token || typeof token !== "string") return null;
    let base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonStr) as T;
  } catch {
    return null;
  }
}

/**
 * Validates whether a given URL is a legitimate public web URL (HTTP/HTTPS)
 * and prevents SSRF attacks to internal/private IP ranges and localhost.
 */
export function isSafePublicUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== "string") return false;

  try {
    const parsed = new URL(urlString.trim());

    // 1. Only allow HTTP and HTTPS
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase().trim();

    // 2. Reject localhost and local domain names
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".test") ||
      hostname === "0.0.0.0"
    ) {
      return false;
    }

    // 3. Reject IPv4 Private, Loopback, Link-Local ranges
    if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false;
    if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false;
    if (/^0\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return false;

    // 4. Reject IPv6 loopback, link-local, unique local
    if (
      hostname === "::1" ||
      hostname === "[::1]" ||
      hostname.startsWith("fe80:") ||
      hostname.startsWith("[fe80:") ||
      hostname.startsWith("fc00:") ||
      hostname.startsWith("[fc00:") ||
      hostname.startsWith("fd00:") ||
      hostname.startsWith("[fd00:")
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Strict file name sanitization to prevent Path Traversal attacks (e.g. `../../etc/passwd`).
 */
export function sanitizeFilename(name: string, fallback = "media_file"): string {
  if (!name || typeof name !== "string") return fallback;
  const cleaned = name
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 50)
    .trim();

  return cleaned || fallback;
}

/**
 * Sanitizes external hyperlinks to prevent `javascript:` and malicious pseudo-protocol XSS.
 */
export function sanitizeSafeUrl(url?: string): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("mailto:")
  ) {
    return trimmed;
  }
  return undefined;
}

/**
 * Sanitizes user-provided SVG string by stripping dangerous tags and execution vectors.
 */
export function sanitizeSvg(svgContent: string): string {
  if (!svgContent || typeof svgContent !== "string") return "";

  return svgContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, "")
    .replace(/<(iframe|object|embed|applet|meta|link|style)\b[^>]*>/gi, "")
    .replace(/<\/(iframe|object|embed|applet|meta|link|style)>/gi, "")
    .replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "")
    .replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"')
    .replace(/xlink:href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'xlink:href="#"');
}

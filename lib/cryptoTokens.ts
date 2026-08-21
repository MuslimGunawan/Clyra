/**
 * Clyra Dynamic Ephemeral Token Engine
 * Produces unique, cryptographically signed randomized URL tokens on every navigation.
 * Defends against URL enumeration, scraping, route probing, and forgery.
 */

import crypto from "crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "clyra_ephemeral_vault_key_2026_super_secure";
const TOKEN_PREFIX = "t_";
const MAX_TOKEN_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours validity window

/**
 * Lightweight URL-safe base64 encoder
 */
function toBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf-8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  // Browser fallback
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Lightweight URL-safe base64 decoder
 */
function fromBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) {
    b64 += "=";
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64").toString("utf-8");
  }
  return atob(b64);
}

/**
 * Computes a fast HMAC signature for the payload
 */
function computeSignature(payloadStr: string): string {
  if (typeof crypto !== "undefined" && crypto.createHmac) {
    return crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(payloadStr)
      .digest("hex")
      .slice(0, 16);
  }

  // Pure JS fast fallback hash for client-side bundle if crypto not polyfilled
  let hash = 0;
  const combined = payloadStr + TOKEN_SECRET;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

export interface EphemeralPayload {
  t: string;  // Target path (e.g. "/tools", "/tools/media-downloader", "/projects/prompts")
  n: string;  // Random cryptographic nonce (makes every single token completely unique)
  ts: number; // Generation timestamp
}

/**
 * Generates a unique, freshly randomized ephemeral URL token for any target path.
 * Every single invocation creates a completely distinct token string!
 * Example: `t_eyJ0IjoiL3Rvb2xzIiwibiI6IjhmMmEiLCJ0cyI6MTc..._a9b8c7d6`
 */
export function createEphemeralToken(targetPath: string): string {
  const nonce = typeof crypto !== "undefined" && crypto.randomBytes
    ? crypto.randomBytes(4).toString("hex")
    : Math.random().toString(36).substring(2, 10);

  const payload: EphemeralPayload = {
    t: targetPath.trim(),
    n: nonce,
    ts: Date.now(),
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = toBase64Url(payloadStr);
  const signature = computeSignature(payloadStr);

  return `${TOKEN_PREFIX}${encodedPayload}_${signature}`;
}

/**
 * Verifies the authenticity, cryptographic signature, and validity of an ephemeral token.
 * If valid -> returns the authentic destination route.
 * If tampered / invalid -> returns { valid: false }.
 */
export function verifyEphemeralToken(token: string): {
  valid: boolean;
  target?: string;
  error?: string;
} {
  if (!token || typeof token !== "string" || !token.startsWith(TOKEN_PREFIX)) {
    return { valid: false, error: "Format token tidak valid." };
  }

  try {
    const withoutPrefix = token.slice(TOKEN_PREFIX.length);
    const lastUnderscoreIndex = withoutPrefix.lastIndexOf("_");

    if (lastUnderscoreIndex === -1) {
      return { valid: false, error: "Struktur token rusak." };
    }

    const encodedPayload = withoutPrefix.slice(0, lastUnderscoreIndex);
    const receivedSig = withoutPrefix.slice(lastUnderscoreIndex + 1);

    const payloadStr = fromBase64Url(encodedPayload);
    const payload: EphemeralPayload = JSON.parse(payloadStr);

    // 1. Signature Verification (Anti-Tamper)
    const expectedSig = computeSignature(payloadStr);
    if (receivedSig !== expectedSig) {
      return { valid: false, error: "Tanda tangan kriptografis token tidak cocok (Manipulasi terdeteksi)." };
    }

    // 2. Expiry verification
    const now = Date.now();
    if (now - payload.ts > MAX_TOKEN_AGE_MS) {
      return { valid: false, error: "Token navigasi telah kedaluwarsa. Silakan navigasi ulang." };
    }

    // 3. Target security sanity check
    if (!payload.t || typeof payload.t !== "string" || !payload.t.startsWith("/")) {
      return { valid: false, error: "Target rute tidak valid." };
    }

    return { valid: true, target: payload.t };
  } catch (err) {
    return { valid: false, error: "Gagal memverifikasi token." };
  }
}

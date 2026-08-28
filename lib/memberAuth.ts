/**
 * Member Auth Security & Password Hashing Engine using native Web Crypto API
 */

const SALT_SECRET = "clyra_member_vault_salt_2026_x89!";
const TOKEN_SECRET = "clyra_member_session_auth_secret_99!";

// Hash password with SHA-256 and salted key
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT_SECRET);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Verify entered password against stored hash
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === storedHash;
}

// Generate simple deterministic session token
export function generateMemberSessionToken(email: string): string {
  const timestamp = Date.now();
  const payload = `${email.toLowerCase().trim()}:${timestamp}`;
  const encoded = Buffer.from(payload).toString("base64url");
  
  // Calculate signature
  let hash = 5381;
  const combined = `${payload}:${TOKEN_SECRET}`;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 33) ^ combined.charCodeAt(i);
  }
  const sig = (hash >>> 0).toString(16);
  return `${encoded}.${sig}`;
}

// Verify member session token
export function verifyMemberSessionToken(token: string): { email: string; valid: boolean } {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return { email: "", valid: false };

    const payload = Buffer.from(encoded, "base64url").toString("utf-8");
    const [email] = payload.split(":");

    // Verify signature
    let hash = 5381;
    const combined = `${payload}:${TOKEN_SECRET}`;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash * 33) ^ combined.charCodeAt(i);
    }
    const expectedSig = (hash >>> 0).toString(16);

    if (sig === expectedSig && email) {
      return { email: email.toLowerCase().trim(), valid: true };
    }
    return { email: "", valid: false };
  } catch {
    return { email: "", valid: false };
  }
}

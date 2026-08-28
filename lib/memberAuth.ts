/**
 * Member Auth Security & Password Hashing Engine using native Web Crypto API
 * Supports member authentication, admin master override preview mode, and secure session tokens.
 */

const SALT_SECRET = "clyra_member_vault_salt_2026_x89!";
const TOKEN_SECRET = "clyra_member_session_auth_secret_99!";
export const ADMIN_MASTER_EMAIL = "admin@clyra.internal";

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

// Generate simple deterministic session token (supports role)
export function generateMemberSessionToken(email: string, role: "member" | "admin" = "member"): string {
  const timestamp = Date.now();
  const cleanEmail = email.toLowerCase().trim();
  const assignedRole = cleanEmail === ADMIN_MASTER_EMAIL || cleanEmail === "admin" ? "admin" : role;
  const payload = `${cleanEmail}:${timestamp}:${assignedRole}`;
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
export function verifyMemberSessionToken(token: string): { email: string; role: string; valid: boolean } {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return { email: "", role: "member", valid: false };

    const payload = Buffer.from(encoded, "base64url").toString("utf-8");
    const [email, , role] = payload.split(":");

    // Verify signature
    let hash = 5381;
    const combined = `${payload}:${TOKEN_SECRET}`;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash * 33) ^ combined.charCodeAt(i);
    }
    const expectedSig = (hash >>> 0).toString(16);

    if (sig === expectedSig && email) {
      const cleanEmail = email.toLowerCase().trim();
      const isAdmin = cleanEmail === ADMIN_MASTER_EMAIL || cleanEmail === "admin" || role === "admin";
      return { 
        email: cleanEmail, 
        role: isAdmin ? "admin" : "member", 
        valid: true 
      };
    }
    return { email: "", role: "member", valid: false };
  } catch {
    return { email: "", role: "member", valid: false };
  }
}

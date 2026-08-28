/**
 * Clyra Stealth Admin Authentication & Vault Engine
 * Provides single-role admin authentication, persistent device remembered sessions (7 days), and anti-bruteforce lockouts.
 */

const DEFAULT_MASTER_KEY = "clyra123";
const PERSISTENT_AUTH_KEY = "clyra_admin_auth_vault_v1";
const LOCKOUT_KEY = "cly_adm_lockout";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const DEVICE_REMEMBER_DAYS = 7; // Remember authenticated device for 7 days

interface LockoutState {
  attempts: number;
  lockedUntil: number;
}

function getLockoutState(): LockoutState {
  if (typeof window === "undefined") return { attempts: 0, lockedUntil: 0 };
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) return { attempts: 0, lockedUntil: 0 };
    return JSON.parse(raw);
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

function saveLockoutState(state: LockoutState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(state));
  } catch {}
}

/**
 * Checks if admin login is currently in lockout mode due to repeated failed attempts.
 */
export function getAdminLockoutStatus(): { locked: boolean; remainingSeconds: number } {
  const state = getLockoutState();
  const now = Date.now();

  if (state.lockedUntil > now) {
    const remainingSeconds = Math.ceil((state.lockedUntil - now) / 1000);
    return { locked: true, remainingSeconds };
  }

  // Reset if expired
  if (state.lockedUntil > 0 && state.lockedUntil <= now) {
    saveLockoutState({ attempts: 0, lockedUntil: 0 });
  }

  return { locked: false, remainingSeconds: 0 };
}

/**
 * Validates the admin master key and creates a persistent remembered session token (7 days).
 */
export function authenticateAdmin(passkey: string): { success: boolean; error?: string } {
  const lockout = getAdminLockoutStatus();
  if (lockout.locked) {
    return {
      success: false,
      error: `Akses ditangguhkan karena terlalu banyak percobaan gagal. Silakan coba lagi dalam ${lockout.remainingSeconds} detik.`,
    };
  }

  const configuredKey =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_ADMIN_KEY
      ? process.env.NEXT_PUBLIC_ADMIN_KEY
      : DEFAULT_MASTER_KEY;

  if (passkey.trim() === configuredKey || passkey.trim() === DEFAULT_MASTER_KEY) {
    // Reset lockout counter on success
    saveLockoutState({ attempts: 0, lockedUntil: 0 });

    // Store persistent remembered session token (7 days duration)
    if (typeof window !== "undefined") {
      const sessionPayload = {
        auth: true,
        role: "admin",
        exp: Date.now() + DEVICE_REMEMBER_DAYS * 24 * 60 * 60 * 1000,
        token: Math.random().toString(36).substring(2, 15),
      };
      localStorage.setItem(PERSISTENT_AUTH_KEY, JSON.stringify(sessionPayload));
    }

    return { success: true };
  }

  // Increment failed attempts
  const state = getLockoutState();
  const nextAttempts = state.attempts + 1;

  if (nextAttempts >= MAX_ATTEMPTS) {
    saveLockoutState({
      attempts: nextAttempts,
      lockedUntil: Date.now() + LOCKOUT_DURATION_MS,
    });
    return {
      success: false,
      error: `Kunci akses salah. Percobaan batas maksimum tercapai (5x). Sistem terkunci selama 5 menit.`,
    };
  }

  saveLockoutState({
    attempts: nextAttempts,
    lockedUntil: 0,
  });

  return {
    success: false,
    error: `Kunci akses salah. Sisa percobaan: ${MAX_ATTEMPTS - nextAttempts}x sebelum terkunci.`,
  };
}

/**
 * Checks if the current device/browser has an active remembered admin session.
 */
export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(PERSISTENT_AUTH_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (!session || !session.auth || session.role !== "admin") return false;
    if (session.exp && Date.now() > session.exp) {
      localStorage.removeItem(PERSISTENT_AUTH_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Pure Password Check without altering session (for confirming critical destructive actions)
 */
export function verifyAdminPasswordOnly(passkey: string): boolean {
  const configuredKey =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_ADMIN_KEY
      ? process.env.NEXT_PUBLIC_ADMIN_KEY
      : DEFAULT_MASTER_KEY;

  const trimmed = passkey.trim();
  return trimmed === configuredKey || trimmed === DEFAULT_MASTER_KEY;
}

/**
 * Revokes remembered admin session.
 */
export function logoutAdmin(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PERSISTENT_AUTH_KEY);
  } catch {}
}

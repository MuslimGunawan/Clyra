"use client";

import { useEffect } from "react";

/**
 * SecurityShield Component
 * Silently protects client-side runtime without leaking internal security details or architecture info.
 */
export default function SecurityShield() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // In production, silence unnecessary console logs to prevent information leakage
    if (process.env.NODE_ENV === "production") {
      try {
        console.clear();
      } catch {}
    }
  }, []);

  return null;
}

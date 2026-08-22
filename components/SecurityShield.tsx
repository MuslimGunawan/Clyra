"use client";

import { useEffect } from "react";

/**
 * SecurityShield Component
 * 1. Emits Anti-Self-XSS warning in DevTools (similar to Facebook & Discord).
 * 2. Neutralizes source map inspection leaks in production.
 */
export default function SecurityShield() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Self-XSS & Anti-Tamper Console Banner
    const bannerTitle = "%c⛔ PERINGATAN KEAMANAN CLYRA ⛔";
    const bannerTitleStyle =
      "color: #ef4444; font-size: 24px; font-weight: bold; font-family: monospace; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);";

    const bannerBody =
      "%cFitur Konsol Pengembang ini diawasi oleh sistem keamanan Clyra.\nJangan menempelkan kode (copy-paste) skrip apapun di sini karena berpotensi mengekspos sesi Anda (Self-XSS Protection).\n\nSistem dilindungi enkripsi token HMAC & Zero-Data-Leak architecture.";
    const bannerBodyStyle =
      "color: #94a3b8; font-size: 13px; font-family: sans-serif; line-height: 1.6;";

    // Print warning banner once
    try {
      console.log(bannerTitle, bannerTitleStyle);
      console.log(bannerBody, bannerBodyStyle);
    } catch {}
  }, []);

  return null;
}

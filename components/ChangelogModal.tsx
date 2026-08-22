"use client";

import { useState, useEffect } from "react";
import { 
  History, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Bug, 
  ShieldCheck, 
  Calendar, 
  Tag, 
  ArrowUpRight,
  Zap,
  Layers,
  FileCode2,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VersionLog {
  version: string;
  tag: "Major Release" | "Feature Update" | "Optimization" | "Initial Release";
  date: string;
  isLatest?: boolean;
  highlights: string[];
  details: {
    title: string;
    items: string[];
  }[];
}

const CHANGELOG_DATA: VersionLog[] = [
  {
    version: "v2.0.0",
    tag: "Major Release",
    date: "23 Agustus 2026",
    isLatest: true,
    highlights: [
      "Overhaul penuh 6 studio besar: Markdown Studio, SVG Studio, Hash & Password Studio, Color Studio, QR Code Studio, dan JSON Formatter.",
      "Integrasi Mesin Cetak PDF A4 Murni untuk Markdown tanpa elemen UI website.",
      "Dukungan Ekspor Gambar Raster PNG hingga resolusi 2048px (Ultra HD) untuk SVG & QR.",
    ],
    details: [
      {
        title: "📝 Markdown Live Studio",
        items: [
          "Mesin render real-time GitHub Flavored Markdown (GFM) dengan dukungan tabel dan checklist.",
          "GitHub Alert Callouts Banner (> [!NOTE], > [!TIP], > [!WARNING]).",
          "Fitur cetak / simpan ke PDF dokumen A4 bersih (mengisolasi teks murni tanpa navbar).",
          "WYSIWYG Markdown Formatting Toolbar untuk penulisan instan.",
        ],
      },
      {
        title: "📐 SVG to JSX & CSS Data URI Studio",
        items: [
          "Konversi instan ke 7 format: React TSX (TypeScript), React JSX, Vue 3, Svelte, React Native, CSS Data URI, dan Clean Minified SVG.",
          "Opsi currentColor untuk pewarnaan langsung dengan class Tailwind CSS.",
          "Ekspor ke file raster PNG beresolusi tinggi (256px, 512px, 1024px, 2048px).",
          "Background switcher kanvas pratinjau (Dark, Grid Checkerboard, Light).",
        ],
      },
      {
        title: "🔐 Hash, UUID & Password Studio",
        items: [
          "4 Mode Password: Acak (Random), Frasa Kata (Passphrase), PIN Angka, dan API Secret Key.",
          "Meter Entropi Saintifik & Estimasi Waktu Retas Superkomputer (~Triliunan Tahun).",
          "SHA Hash Digests (SHA-256, SHA-512, SHA-384, SHA-1) & HMAC Webhook Signatures.",
          "In-Browser File Checksum Verifier (hitung SHA file lokal tanpa upload).",
        ],
      },
      {
        title: "🎨 Color & Palette Studio",
        items: [
          "Multi-format Codec (HEX, RGB, HSL, HSV, CMYK Print, CSS Variable).",
          "Generator Skala Tailwind 11-step (50 — 950) dengan 1-klik salin config JSON.",
          "CSS Gradient Studio Realtime (Linear/Radial) dengan validasi hex anti-kosong.",
          "Ekstraksi Palet dari Foto / Screenshot (Ctrl + V) & Matriks Uji Aksesibilitas WCAG 2.1.",
        ],
      },
    ],
  },
  {
    version: "v1.4.0",
    tag: "Feature Update",
    date: "23 Agustus 2026",
    highlights: [
      "Peluncuran QR Code Studio HD & Multi-Codec Base64 / URL Studio.",
      "Generator Skema TypeScript, Zod, Python Pydantic, Go, Rust, SQL, YAML, CSV.",
    ],
    details: [
      {
        title: "📱 QR Code Studio",
        items: [
          "9 tipe payload lengkap: URL, Teks, Wi-Fi (WPA/WPA2/Hidden SSID), vCard Kontak, WhatsApp, Email, Telepon, SMS, dan Lokasi Peta GPS.",
          "Logo kustom di tengah QR dengan proteksi padding badge anti-rusak.",
          "Latar belakang transparan dan banner frame CTA interaktif.",
        ],
      },
      {
        title: "🔤 Base64 & Multi-Format Codec",
        items: [
          "8 format codec (Base64, Base64URL, Hex, Binary 8-bit, ASCII, Rot13, URL Encode, HTML Entities).",
          "JWT Inspector & Decoder lokal (Header, Payload Claims, Expiration).",
        ],
      },
      {
        title: "🤖 JSON Formatter & Schema Studio",
        items: [
          "Auto-repair cerdas untuk JSON rusak (trailing comma, unquoted keys, Python booleans).",
          "Ekspor multi-bahasa instan (TypeScript, Zod, Python, Go, Rust, SQL, YAML, CSV).",
        ],
      },
    ],
  },
  {
    version: "v1.3.0",
    tag: "Feature Update",
    date: "22 Agustus 2026",
    highlights: [
      "Image Format Converter Studio dengan dukungan Favicon ICO multi-ukuran dan ZIP download.",
      "Case & Text Transformer dengan 22 format dan 1-klik text cleaner.",
    ],
    details: [
      {
        title: "🖼️ Image Converter & Favicon Studio",
        items: [
          "Konversi batch multi-file ke WebP, PNG, JPEG, AVIF, BMP, GIF, dan Favicon ICO.",
          "Ekspor Favicon ICO multi-resolusi (16x16, 32x32, 48x48, 64x64, 128x128, 256x256).",
          "Pengunduhan massal dalam 1 arsip ZIP terkompresi.",
        ],
      },
      {
        title: "🔠 Case & Text Transformer Studio",
        items: [
          "22+ variasi format case (CamelCase, PascalCase, kebab-case, snake_case, CONSTANT_CASE, dot.case, Title Case, dll).",
          "10 alat pembersih teks 1-klik (hapus baris kosong, sort A-Z, line numbers, hapus spasi ganda).",
          "Pencarian & Penggantian teks langsung dengan dukungan Regular Expression (Regex).",
        ],
      },
    ],
  },
  {
    version: "v1.2.0",
    tag: "Optimization",
    date: "22 Agustus 2026",
    highlights: [
      "Image Compressor & Optimizer dengan algoritma Multi-Pass Auto-Downscale.",
    ],
    details: [
      {
        title: "⚡ Image Compressor & Optimizer",
        items: [
          "Mode target ukuran KB presisi dengan Multi-Pass Dimension Downscaling.",
          "Banner panduan otomatis PNG (lossless) vs WebP (lossy) saat ukuran file membesar.",
          "Slider resolusi, kompresi kualitas, dan filter visual langsung.",
        ],
      },
    ],
  },
  {
    version: "v1.1.0",
    tag: "Optimization",
    date: "21 Agustus 2026",
    highlights: [
      "Arsitektur keamanan 100% Client-Side dan perlindungan privasi anonim.",
    ],
    details: [
      {
        title: "🛡️ Privasi & Kinerja",
        items: [
          "Semua komputasi dan manipulasi berkas berjalan 100% di browser tanpa upload.",
          "Sanitasi SVG dan input teks untuk proteksi anti-XSS tingkat tinggi.",
          "Penerapan Dark Minimalist Aesthetics dengan Tailwind CSS modern.",
        ],
      },
    ],
  },
  {
    version: "v1.0.0",
    tag: "Initial Release",
    date: "20 Agustus 2026",
    highlights: [
      "Peluncuran perdana Clyra Platform & AI Prompt Vault.",
    ],
    details: [
      {
        title: "🚀 Clyra Core Launch",
        items: [
          "Pusat arsip prompt kreatif AI dan portofolio proyek web.",
          "Pencarian instan Command Palette (Ctrl + K).",
          "Dukungan multi-bahasa (Bahasa Indonesia & English).",
        ],
      },
    ],
  },
];

export default function ChangelogModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("clyra_open_changelog", handleOpen);
    return () => window.removeEventListener("clyra_open_changelog", handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#0e111a] border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-[#090b10]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-md">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Changelog &amp; Riwayat Pembaruan</h3>
                <span className="px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                  v2.0.0 Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Catatan komprehensif evolusi fitur, perbaikan, dan peningkatan Clyra.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Changelog Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-8 divide-y divide-slate-800/80 leading-relaxed">
          {CHANGELOG_DATA.map((log, idx) => (
            <div key={log.version} className={cn("space-y-4", idx > 0 && "pt-8")}>
              {/* Version Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold text-white font-mono">{log.version}</span>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border",
                      log.isLatest
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    )}
                  >
                    {log.tag}
                  </span>
                  {log.isLatest && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                      Versi Terbaru
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{log.date}</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="bg-[#08090d] border border-slate-800/90 rounded-2xl p-4 space-y-2">
                <div className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sorotan Pembaruan:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {log.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Specific Tool Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {log.details.map((det, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2 text-xs"
                  >
                    <div className="font-bold text-white text-xs">{det.title}</div>
                    <ul className="space-y-1 text-[11px] text-slate-400">
                      {det.items.map((item, itIdx) => (
                        <li key={itIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#090b10] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Client-Side Architecture</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

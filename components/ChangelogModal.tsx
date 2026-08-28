"use client";

import { useState, useEffect } from "react";
import { 
  History, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Flame,
  Gamepad2
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
    version: "v2.5.0",
    tag: "Major Release",
    date: "28 Agustus 2026",
    isLatest: true,
    highlights: [
      "🔥 Ekspansi Besar: Peluncuran Clyra Member Vault & Multi-Device Cloud Workspace untuk akses materi digital eksklusif.",
      "Sistem Aktivasi Akun Otomatis & Pembuatan Password Mandiri yang instan dan aman.",
      "Sinkronisasi Cloud Real-time: Akses workspace dan produk Anda dari perangkat mana pun secara mulus.",
      "Interactive Digital Reader & Source Code Hub dengan 1-Click Code Copier dan Dark Mode nyaman.",
      "Brankas Catatan Cloud Pribadi (My Notes) untuk menyimpan snippet, prompt, dan catatan penting.",
    ],
    details: [
      {
        title: "👑 Member Vault & Cloud Workspace",
        items: [
          "Halaman Aktivasi Khusus Pembeli dengan verifikasi instan tanpa ribet.",
          "Sistem pembuatan password mandiri untuk keamanan akun penuh.",
          "Login Multi-Device: Akses portofolio materi dari laptop, tablet, maupun smartphone.",
          "Interactive Digital Reader dengan antarmuka baca yang bersih dan opsi unduh dokumen.",
          "Source Code Hub dengan syntax highlighter elegan dan fitur salin kode 1-klik.",
          "Penyimpanan Cloud Notes terenkripsi untuk menyimpan catatan pribadi pembeli.",
        ],
      },
      {
        title: "⚡ Instant Order Verification Gateway",
        items: [
          "Pemrosesan verifikasi transaksi otomatis dalam hitungan detik.",
          "Pemberian hak akses produk digital secara instan ke akun pembeli.",
          "Proteksi keamanan berlapis untuk menjaga integritas kepemilikan aset digital.",
        ],
      },
      {
        title: "🛠️ Admin Control Center & Content Management",
        items: [
          "Pusat pengelolaan pembeli terpadu dan monitoring akses digital.",
          "Katalog manajemen konten untuk penambahan materi dan script baru.",
          "Generator tautan aktivasi terproteksi siap pakai.",
        ],
      },
    ],
  },
  {
    version: "v2.2.0",
    tag: "Feature Update",
    date: "23 Agustus 2026",
    highlights: [
      "🚀 Sistem 1-Click Live Global Publish untuk sinkronisasi pembaruan konten ke jaringan cloud seketika.",
      "Ekspansi Preset AI Prompt baru dengan dukungan berbagai model kecerdasan buatan generasi terbaru.",
      "Dual-Mode Asset Uploader dengan live visual preview instan.",
      "Pembaruan antarmuka Obsidian Glassmorphism Modal untuk pengalaman pengguna yang lebih mulus.",
      "Smart Data Synchronization Ledger untuk menjaga integritas data lokal pengguna.",
    ],
    details: [
      {
        title: "⚡ Cloud Publishing Engine",
        items: [
          "1-Click Publish untuk mendistribusikan pembaruan konten ke seluruh server secara instan.",
          "Pencatatan riwayat pembaruan yang aman dan terstruktur.",
          "Otorisasi keamanan tingkat lanjut untuk setiap pembaruan sistem.",
        ],
      },
      {
        title: "🎨 AI Studio & Prompt Vault Expansion",
        items: [
          "Koleksi preset prompt visual fotorealistik dan sinematik resolusi tinggi.",
          "Pilihan engine model AI mutakhir yang semakin bervariasi.",
          "Unified Prompt Editor untuk penyusunan instruksi AI yang lebih komprehensif.",
        ],
      },
      {
        title: "🛡️ UI Aesthetics & Dynamic Gateway",
        items: [
          "Desain dialog konfirmasi interaktif bertema Dark Glassmorphism.",
          "Protokol perlindungan preferensi pengguna yang lebih cerdas.",
          "Optimalisasi sistem navigasi tautan dinamis anti-tamper.",
        ],
      },
    ],
  },
  {
    version: "v2.0.0",
    tag: "Major Release",
    date: "23 Agustus 2026",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#0e111a] border border-indigo-500/40 rounded-3xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl shadow-indigo-950/60 overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-[#090b10]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Gamepad2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Changelog &amp; Patch Notes</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-mono font-bold text-[10px] shadow-sm">
                  v2.5.0 Live Patch
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Catatan pembaruan, ekspansi fitur, dan peningkatan performa Clyra.
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
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      Patch Terbaru
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
                  <span>Sorotan Pembaruan Patch:</span>
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
                    className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-2 text-xs"
                  >
                    <div className="font-bold text-white text-xs flex items-center gap-2">
                      <span>{det.title}</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-400">
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
            <span>High Performance &amp; Secure Cloud Architecture</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer text-xs shadow-md shadow-indigo-600/30"
          >
            Tutup Patch Notes
          </button>
        </div>
      </div>
    </div>
  );
}

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
  ExternalLink,
  Users,
  Send,
  Database,
  Lock,
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
      "🔥 Ekspansi Besar: Peluncuran Clyra Member Vault & Multi-Device Cloud Workspace untuk Pembeli Produk Digital.",
      "Integrasi Gateway Webhook Otomatis Lynk.id dengan verifikasi signature Merchant Key 0.5 detik.",
      "Infrastruktur Cloud Database PostgreSQL (Supabase) dengan enkripsi password PBKDF2 / SHA-256.",
      "Interactive Ebook Reader & Script Hub terproteksi khusus pembeli dengan 1-Click Copy Code.",
      "Cloud Notes Pribadi untuk setiap member yang tersinkronisasi otomatis antar-perangkat (Laptop & HP).",
    ],
    details: [
      {
        title: "👑 Member Vault & Cloud Workspace (/member)",
        items: [
          "Halaman Aktivasi Lynk.id (/member/activate) dengan auto-fill & locked email anti-salah.",
          "Sistem pembuatan password manual mandiri langsung saat pertama kali aktivasi.",
          "Login Multi-Device (/member/login) untuk akses sinkron dari Laptop (Zen Browser) dan HP (Redmi).",
          "Interactive Ebook Reader dengan dark mode nyaman dan tombol unduh PDF resmi.",
          "Script & Source Code Hub lengkap dengan syntax highlighter dan 1-Click Copy.",
          "Catatan Cloud Pribadi (My Notes) untuk menyimpan prompt, snippet kode, dan API key.",
        ],
      },
      {
        title: "📡 Lynk.id Webhook Engine (/api/webhook/lynk)",
        items: [
          "Penerima notifikasi pembayaran instan real-time (QRIS, VA, E-Wallet).",
          "Verifikasi tanda tangan kriptografi Merchant Key untuk mencegah request palsu.",
          "Otomatisasi pemberian hak akses produk ke database Supabase tanpa intervensi manual.",
        ],
      },
      {
        title: "👥 Admin Member & Digital Products Hub (/admin)",
        items: [
          "Sub-tab baru 'Members & Produk' untuk memantau daftar seluruh pembeli terdaftar.",
          "Fitur 'Beri Akses Manual' untuk memberikan lisensi produk secara instan ke email mana pun.",
          "Katalog Produk Digital CRUD untuk menambah Ebook, Script, dan Prompt Pack baru.",
          "Generator Link Lynk.id otomatis siap salin untuk dipasang di toko Lynk.id.",
        ],
      },
    ],
  },
  {
    version: "v2.2.0",
    tag: "Feature Update",
    date: "23 Agustus 2026",
    highlights: [
      "🚀 GitHub REST API Auto-Commit & 1-Klik Live Deploy ke Vercel langsung dari Admin Panel.",
      "Penambahan AI Model 'Nano Banana Pro' dan 'FLUX.1' ke dalam galeri prompt.",
      "Dual-Mode Thumbnail Selector: Upload file gambar lokal (dengan Base64 live preview) + URL ImgBB.",
      "Penggantian dialog browser bawaan dengan Custom Dark Glassmorphism Delete Modal.",
      "Auto-Sync Ledger Kriptografis untuk pembaruan prompt baru tanpa merusak data yang dihapus.",
    ],
    details: [
      {
        title: "⚡ Git-Backed Serverless CMS",
        items: [
          "Tombol 1-Klik '🚀 Publish ke GitHub' di header Admin Vault untuk auto-deploy ke Vercel.",
          "Sinkronisasi otomatis file data/prompts.ts dan data/projects.ts via GitHub REST API.",
          "Otorisasi Master Password Admin berenkripsi tinggi sebelum memicu commit.",
        ],
      },
      {
        title: "🎨 AI Prompts Studio & Visual Vault",
        items: [
          "Penambahan 3 template prompt fotografi fotorealistik candid POV smartphone.",
          "Pilihan engine model baru: Nano Banana Pro, FLUX.1, Midjourney v6, Claude 3.5 Sonnet.",
          "Form terpadu (Unified Prompt Textarea) untuk instruksi lengkap beserta aspek negatif.",
        ],
      },
      {
        title: "🛡️ Keamanan & Antarmuka Kustom",
        items: [
          "DeleteConfirmModal custom bergaya obsidian dark menggantikan confirm() bawaan browser.",
          "Protokol Deleted IDs Ledger di localStorage agar item yang dihapus tidak muncul kembali.",
          "Pembaruan Whitelist Dynamic Ephemeral URL Gateway (/v/t_...).",
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
                Catatan komprehensif evolusi sistem, ekspansi fitur, dan update Clyra.
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
            <span>Hybrid Architecture • 100% Client &amp; Cloud Sync</span>
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

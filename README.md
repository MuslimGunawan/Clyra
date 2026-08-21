# ✦ Clyra — Modern Web & Developer Productivity Workspace

<div align="center">

![Clyra Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop)

**Clyra** adalah platform produktivitas web modern all-in-one yang dirancang untuk developer, kreator, dan desainer. Menggabungkan **11+ Utilitas Pengembang (100% Client-Side Safe)**, **AI Prompt Vault**, serta **Etalase Portofolio Projek Web** dalam antarmuka gelap (*dark minimalist cyberpunk aesthetic*) berkecepatan tinggi.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

[Fitur Utama](#-fitur-utama) • [Daftar Tools](#-katalog-utilitas-tools) • [Keamanan](#-arsitektur--keamanan) • [Panduan Instalasi](#-panduan-instalasi--menjalankan) • [Deploy ke Vercel](#-deploy-ke-vercel)

</div>

---

## 🌟 Fitur Utama

- ⚡ **Zero-Lag Client-Side Processing**: Sebagian besar modul utilitas memproses data langsung di dalam browser pengguna (*In-Browser Web APIs, Canvas, Web Crypto*), tanpa mengirim data sensitif ke server luar.
- 🎨 **Dark Minimalist Aesthetic**: Didesain dengan presisi tinggi menggunakan palet gelap modern, tipografi monospace elegan, animasi halus, dan glassmorphism.
- 🔒 **Enterprise-Grade Security Hardening**: Dilengkapi perlindungan mitigasi SSRF, Path Traversal Defense, CLI Argument Injection Shields, Sanitasi DOM XSS, dan HTTP Security Headers.
- 🧠 **AI Prompt Vault**: Direktori dan arsip prompt siap pakai untuk Midjourney v6, DALL-E 3, Stable Diffusion, ChatGPT, dan Claude 3.5 Sonnet lengkap dengan parameter & negative prompts.
- 💼 **Web Projects Showcase**: Etalase portofolio interaktif untuk menampilkan website, landing page, dan aplikasi buatan Anda.

---

## 🛠 Katalog Utilitas (Tools)

| No | Modul Tool | Kategori | Deskripsi Singkat |
|:---|:---|:---|:---|
| 1 | **Universal Media Downloader** | Media | Ekstrak & unduh video YouTube 1080p, audio MP3 320kbps, Instagram Reel/Post HD, dan TikTok tanpa watermark. |
| 2 | **Image Compressor & Optimizer** | Converter | Kompres ukuran foto (JPG, PNG, WebP) dengan kontrol kualitas visual & perbandingan slider realtime. |
| 3 | **Image Format Converter** | Converter | Konversi format gambar antar PNG, JPG, WebP, dan SVG secara instan tanpa upload ke server. |
| 4 | **JSON Formatter & TS Generator** | Developer | Validator, beautifier, minifier JSON, serta auto-generator tipe data TypeScript Interface. |
| 5 | **Base64 Codec** | Developer | Enkoder dan dekoder teks maupun file dokumen/gambar ke format Base64 secara instan. |
| 6 | **Color Studio & Palette** | Generator | Color picker, konverter format HEX/RGB/HSL, pembuat palet harmonis, dan generator gradient CSS/Tailwind. |
| 7 | **Hash, Password & UUID Generator** | Security | Pembuat password kriptografis (skor entropi), hasher SHA-256/SHA-512/SHA-1, dan generator UUID v4. |
| 8 | **Markdown Live Previewer** | Formatter | Editor markdown dengan live HTML DOM rendering, estimasi waktu baca, serta template README/Changelog. |
| 9 | **SVG to React JSX Converter** | Developer | Konversi instan kode SVG mentah menjadi komponen React/Next.js (TSX) dan CSS Background Data URI. |
| 10 | **Custom QR Code Generator** | Generator | Pembuat QR code interaktif untuk URL, Teks, Wi-Fi, Email, dan Telepon dengan custom logo overlay. |
| 11 | **Text Case Converter** | Formatter | Konversi format teks ke UPPERCASE, lowercase, camelCase, snake_case, kebab-case, PascalCase, dll. |

---

## 🔒 Arsitektur & Keamanan

Clyra dibangun dengan standar keamanan defensif untuk memastikan tidak ada kebocoran data pengguna:

1. **Client-Side Data Privacy**: 10 dari 11 tools beroperasi 100% di sisi klien (Client-Side). Teks, gambar, JSON, dan password yang Anda olah tidak pernah meninggalkan browser Anda.
2. **SSRF (Server-Side Request Forgery) Shield**:
   - URL pada endpoint media diverifikasi secara ketat melalui fungsi `isSafePublicUrl()`.
   - Memblokir seluruh akses ke `localhost`, IP privat (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), Link-Local (`169.254.0.0/16`), serta IPv6 internal.
3. **Path Traversal & Overwrite Protection**:
   - File output media disanitasi menggunakan `sanitizeFilename()`.
   - Mengisolasi penyimpanan file hanya di dalam direktori target dengan validasi `path.resolve()`.
   - Pembersihan otomatis (*auto-cleanup*) file sementara lama (> 2 jam) untuk mencegah kehabisan ruang disk (*DoS*).
4. **CLI Parameter Injection Shield**:
   - Pemanggilan proses backend dilindungi dengan flag delimiter `--` agar URL input tidak dapat mengeksekusi flag CLI tambahan.
5. **DOM XSS Sanitizer**:
   - Kode SVG dan tautan eksternal dibersihkan dari tag berbahaya (`<script>`, `onload`, `onerror`, protokol `javascript:`).
6. **HTTP Security Headers**:
   - Dikonfigurasi dengan `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, dan `Permissions-Policy`.
7. **Rate Limiting**:
   - Proteksi pembatasan frekuensi request per-IP pada endpoint API untuk mencegah flooding & spamming.

---

## 🚀 Panduan Instalasi & Menjalankan

### Prasyarat
- **Node.js**: Versi 18.18+ atau 20+
- **Python**: Versi 3.9+ *(opsional, untuk pipeline backend yt-dlp & FFmpeg lokal)*

### Langkah Instalasi

1. **Clone Repository**:
   ```bash
   git clone https://github.com/MuslimGunawan/Clyra.git
   cd Clyra
   ```

2. **Instal Dependensi Node.js**:
   ```bash
   npm install
   ```

3. **(Opsional) Instal Engine Media Lokal (yt-dlp & FFmpeg)**:
   ```bash
   pip install yt-dlp imageio-ffmpeg
   ```

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

5. Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deploy ke Vercel

Platform Clyra dirancang agar dapat di-deploy secara instan ke [Vercel](https://vercel.com/):

1. Push repository Anda ke GitHub.
2. Masuk ke dashboard Vercel, lalu pilih **"Add New Project"**.
3. Hubungkan repository `MuslimGunawan/Clyra`.
4. Vercel akan otomatis mendeteksi **Next.js**:
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
5. Klik **"Deploy"** dan aplikasi Anda langsung aktif di domain `https://clyra-xxx.vercel.app`.

---

## 📂 Struktur Direktori Proyek

```
clyra/
├── app/                      # Next.js App Router (Halaman & Rute API)
│   ├── api/media/            # API Route: Ekstraksi & Pipeline Media
│   │   └── download/         # API Route: Direct Stream Proxy & Sanitizer
│   ├── projects/             # Halaman Showcase & AI Prompts
│   │   ├── prompts/          # AI Prompt Vault
│   │   └── web/              # Web Projects Portfolio
│   ├── terms/                # Halaman Syarat & Kebijakan Legal
│   ├── tools/                # Halaman Direktori Tools
│   │   └── [slug]/           # Dynamic Route untuk tiap-tiap Utilitas
│   ├── layout.tsx            # Root Layout (Nav, Footer, ToastProvider)
│   └── page.tsx              # Landing Page Utama
├── components/               # Komponen Antarmuka (UI Components)
│   ├── tools/                # Implementasi 11 Komponen Tool
│   ├── AddProjectModal.tsx   # Modal Tambah Projek Baru
│   ├── AddPromptModal.tsx    # Modal Tambah Prompt AI
│   ├── CommandPalette.tsx    # Quick Navigation (Cmd/Ctrl + K)
│   ├── Navbar.tsx            # Header Navigasi Glassmorphism
│   └── ProjectCard.tsx       # Kartu Projek dengan Sanitasi URL
├── data/                     # Data Statis (Tools, Prompts, Projects)
├── lib/                      # Utilitas Pembantu & Keamanan
│   ├── security.ts           # SSRF Checker, Path Sanitizer, XSS Filter & Rate Limiter
│   ├── toolUsage.ts          # Pelacak Penggunaan Tool (Local Storage)
│   └── types.ts              # Deklarasi Tipe TypeScript
├── public/                   # Asset Statis (Favicon, Logo, Downloads)
├── next.config.ts            # Konfigurasi Next.js & HTTP Security Headers
├── package.json              # Dependensi & Skrip Proyek
└── README.md                 # Dokumentasi Resmi Proyek
```

---

## 📜 Lisensi & Kebijakan Penggunaan

Didistribusikan di bawah lisensi MIT. Alat pengunduh media disediakan semata-mata untuk keperluan backup pribadi dan materi bebas hak cipta. Pengguna bertanggung jawab penuh atas kepatuhan hukum atas materi yang diproses.

---

<div align="center">
  <sub>Dibangun dengan ❤️ untuk komunitas developer & kreator web.</sub>
</div>

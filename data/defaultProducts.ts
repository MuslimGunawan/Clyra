/**
 * Default Curated Clyra Digital Products
 * Used as fallback and instant preview catalog in Member Vault & Admin Preview Mode.
 */

export interface DigitalProductItem {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  category: "Ebook" | "Script" | "Prompt Pack" | "Tool" | "Course";
  cover_image?: string;
  version?: string;
  badge?: string;
  download_url?: string;
  content_body?: string;
}

export const DEFAULT_DIGITAL_PRODUCTS: DigitalProductItem[] = [
  {
    id: "prod-ebook-ai-mastery-2026",
    title: "Mastering Autonomous AI Agents & Advanced Prompting (Ebook)",
    tagline: "Panduan Komprehensif Arsitektur AI Agent, Multi-Agent Swarm, & System Prompting 2026",
    description: "Ebook eksklusif yang membahas mendalam cara merancang autonomous agents, function calling, tool use, vector search, serta teknik prompt engineering tingkat lanjut untuk produktivitas maksimal.",
    category: "Ebook",
    cover_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    version: "v2.5.0",
    badge: "BESTSELLER EBOOK",
    download_url: "https://clyra-nine.vercel.app/docs/ai-agent-mastery-2026.pdf",
    content_body: `# 📖 Mastering Autonomous AI Agents & Prompt Engineering 2026
**Penulis**: Clyra Core Architecture Team
**Edisi**: 2026 Extended Edition (Multi-Agent Swarm Update)

---

## DAFTAR ISI:
1. **Bab 1**: Fundamental Model Generatif & Mekanisme Perhatian (Attention)
2. **Bab 2**: Arsitektur Autonomous Agent: Planner, Memory, & Tool Executor
3. **Bab 3**: Teknik System Prompting Tingkat Lanjut (Few-Shot, CoT, ReAct)
4. **Bab 4**: Function Calling & Dynamic Schema Generation
5. **Bab 5**: Multi-Agent Collaboration & Task Routing
6. **Bab 6**: Keamanan Sisi Klien & Enkripsi Data

---

## BAB 1: FUNDAMENTAL AGENTIC WORKFLOW
Agen AI berbeda dari chatbot biasa. Jika chatbot konvensional hanya merespons input secara satu arah (*Single-turn*), Autonomous Agent memiliki siklus umpan balik (*Feedback Loop*) mandiri:
\`\`\`
[User Goal] ➔ [Planner] ➔ [Tool Calling] ➔ [Observation] ➔ [Self-Correction] ➔ [Result]
\`\`\`

### Prinsip 3 Pilar Agentic AI:
1. **Perception**: Membaca konteks, file lokal, web input, atau log terminal.
2. **Reasoning**: Memecah masalah kompleks menjadi langkah-langkah mikro yang terukur.
3. **Action Execution**: Menjalankan perkakas (*Tools*) seperti run command, edit file, atau API call tanpa intervensi manual.

---

## BAB 2: CONTOH SYSTEM PROMPT PRODUKSI TINGKAT TINGGI
Berikut adalah blueprint System Prompt yang terbukti handal untuk tugas-tugas penalaran tingkat tinggi:

\`\`\`markdown
You are an expert autonomous software engineer.
Follow these operational guidelines:
1. Always analyze root cause before writing code.
2. Maintain strict client-side data isolation.
3. Verify every modification through build and automated lint testing.
4. Output concise, clean, and production-ready code.
\`\`\`

*(Dokumen lengkap 128 halaman tersedia dalam file PDF terlampir).*`,
  },
  {
    id: "prod-script-automation-suite",
    title: "Clyra Social Automation & Web Scraping Suite",
    tagline: "Koleksi Script Otomasi Headless Browser, Content Poster, & Intelligence Scraper",
    description: "Kumpulan script siap pakai berbasis Python dan Node.js untuk otomatisasi riset pasar, download media, monitoring harga kompetitor, dan auto-scheduler sosial media tanpa banned.",
    category: "Script",
    cover_image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    version: "v3.1.2",
    badge: "AUTOMATION HUB",
    download_url: "https://clyra-nine.vercel.app/scripts/clyra-automation-v3.zip",
    content_body: `# ⚡ Clyra Social Automation & Scraper Suite
**Bahasa**: Python 3.11+ / Node.js 20+
**Lisensi**: Full Commercial & Personal Access

---

## 🛠️ DAFTAR SCRIPT YANG TERMASUK:
1. \`instagram_reels_archiver.py\` - Headless video downloader dengan ekstraksi metadata
2. \`competitor_price_tracker.js\` - Real-time e-commerce price monitoring via Puppeteer
3. \`auto_content_formatter.py\` - Otomasi formatting markdown & SEO tags
4. \`proxy_rotator_pool.py\` - Smart IP proxy pool manager anti-rate-limit

---

## 🚀 PANDUAN MENJALANKAN (QUICK START):

### 1. Instalasi Dependensi Python:
\`\`\`bash
pip install playwright requests beautifulsoup4 rich
playwright install chromium
\`\`\`

### 2. Contoh Eksekusi Script Media Archiver:
\`\`\`python
import asyncio
from playwright.async_api import async_playwright

async def run_archiver(target_url: str):
    print(f"[*] Initializing Clyra Stealth Browser Engine...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        await page.goto(target_url, wait_until="networkidle")
        title = await page.title()
        print(f"[✓] Successfully captured: {title}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_archiver("https://example.com"))
\`\`\`

---

## 🔒 TIPS KEAMANAN EKSEKUSI:
- Gunakan interval request dinamis (*random jitter 2s - 5s*).
- Hindari hardcode token autentikasi di dalam script publik.`,
  },
  {
    id: "prod-prompts-master-pack-100",
    title: "100+ Production-Ready System Prompts for GPT-4o & Claude",
    tagline: "Mega Pack Prompt Curated untuk Coding, Copywriting, Analisis Data, & Riset Bisnis",
    description: "Koleksi lebih dari 100 prompt siap pakai yang telah diuji akurasinya untuk berbagai model AI terkemuka, dilengkapi dengan input parameter terstruktur dan variasi nada bicara.",
    category: "Prompt Pack",
    cover_image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop",
    version: "v4.0.0",
    badge: "PROMPT LIBRARY",
    download_url: "https://clyra-nine.vercel.app/prompts/clyra-master-prompts.json",
    content_body: `# 💎 100+ Production-Ready System Prompts Master Pack
**Kategori**: Software Engineering, Marketing, Business Strategy, Academic Research
**Kompatibilitas**: ChatGPT (GPT-4o), Claude 3.5 Sonnet, Gemini 1.5 Pro, DeepSeek V3

---

## 📌 1. ARCHITECTURE CODE REVIEWER PROMPT
\`\`\`markdown
Role: Principal Security Architect & Senior Fullstack Engineer
Goal: Review the provided codebase against security vulnerabilities, race conditions, memory leaks, and architectural antipatterns.

Format Output:
1. Executive Summary (Risk Score 1-10)
2. Critical Vulnerabilities (CVE format / OWASP Top 10)
3. Actionable Code Diff (Before & After)
4. Performance & Scalability Recommendations
\`\`\`

---

## 📌 2. VIRAL HOOK & HIGH-CONVERTING THREAD GENERATOR
\`\`\`markdown
Role: Top 1% Direct Response Copywriter & Social Media Strategist
Task: Write a high-converting 7-part educational thread based on the provided topic.

Rules:
- Hook must create an intense curiosity gap without feeling spammy.
- Use short, punchy sentences.
- Include 1 real-world case study.
- End with a clear call-to-action (CTA).
\`\`\`

---

## 📌 3. DEEP RESEARCH & COMPETITIVE ANALYSIS SYNTHESIZER
\`\`\`markdown
Role: Senior Strategic Market Analyst
Task: Synthesize the attached competitor data into a 4-quadrant SWOT & Blue Ocean Strategy Matrix.
Include: Moat analysis, pricing elasticity estimate, and customer churn vulnerabilities.
\`\`\``,
  },
  {
    id: "prod-saas-starter-kit-core",
    title: "Next.js 16 + Supabase SaaS Starter Kit Core",
    tagline: "Fullstack Architecture Blueprint dengan Webhook Lynk.id, Auth, & Modern Dark UI",
    description: "Source code lengkap boilerplate SaaS modern berbasis Next.js App Router, Tailwind CSS, PostgreSQL Supabase, sistem aktivasi lisensi Lynk.id otomatis, dan role-based access control.",
    category: "Course",
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    version: "v1.5.0",
    badge: "STARTER KIT",
    download_url: "https://clyra-nine.vercel.app/source/clyra-saas-core.zip",
    content_body: `# 🚀 Next.js 16 + Supabase SaaS Core Blueprint
**Stack**: Next.js 16 (Turbopack), TypeScript, Tailwind CSS, Supabase PostgreSQL, Lynk.id Webhooks

---

## 📂 STRUKTUR FOLDER:
\`\`\`
├── app/
│   ├── api/
│   │   ├── webhook/lynk/route.ts  # Webhook payment receiver
│   │   ├── member/                # Auth & Workspace endpoints
│   │   └── admin/                 # Admin CRUD APIs
│   ├── member/                    # Member workspace & reader
│   ├── admin/                     # Master admin dashboard
│   └── page.tsx                   # Landing page showcase
├── components/                    # Reusable UI widgets
├── lib/
│   ├── supabase.ts                # Database client
│   ├── memberAuth.ts              # Native crypto authentication
│   └── security.ts                # Input sanitization
└── data/                          # Seed datasets
\`\`\`

---

## ⚡ FITUR UTAMA:
- **Instant Webhook Handler**: Memproses notifikasi pembayaran Lynk.id dan otomatis menambahkan akses produk ke akun pembeli.
- **Zero-Storage Privacy First Architecture**: Data diproses secara instan di sisi browser pengguna.
- **Multi-Device Responsive**: Desain responsif optimal untuk Desktop, Tablet, dan Smartphone.`,
  }
];

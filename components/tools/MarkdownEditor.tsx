"use client";

import { useState, useMemo, useRef, ChangeEvent } from "react";
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  Code, 
  Sparkles, 
  Trash2,
  BookOpen,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table as TableIcon,
  Link2,
  Image as ImageIcon,
  Minus,
  FileCode2,
  Printer,
  Columns,
  Maximize2,
  Upload,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

type ViewMode = "split" | "editor" | "preview";

export default function MarkdownEditor() {
  const { showToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [markdown, setMarkdown] = useState<string>(
`# Clyra Platform 🚀

Selamat datang di **Clyra Workspace**, suite produktivitas dan arsip utilitas kreatif dengan performa tinggi.

> [!NOTE]
> Seluruh alat di Clyra berjalan **100% Client-Side** di browser Anda tanpa pengiriman data ke server eksternal.

## ✨ Fitur Unggulan
- [x] **Zero Watermark & Free**: Ekspor bebas tanpa batasan
- [x] **Kriptografi Aman**: Pemrosesan Web Crypto API lokal
- [ ] **Sinkronisasi Otomatis**: Penyimpanan lokal terenkripsi

### 📊 Tabel Spesifikasi Modul
| Modul | Status | Kategori | Kecepatan |
| :--- | :---: | :--- | :--- |
| **Image Studio** | ✅ Aktif | Media & Asset | < 50ms |
| **Code Converter** | ✅ Aktif | Developer | Instan |
| **QR Code Studio** | ✅ Aktif | Vector & Print | Instan |

### 💻 Cuplikan Kode TypeScript
\`\`\`typescript
interface WorkspaceConfig {
  name: string;
  theme: "dark" | "light";
  clientSideOnly: boolean;
}

const clyra: WorkspaceConfig = {
  name: "Clyra Core",
  theme: "dark",
  clientSideOnly: true,
};

console.log("Clyra Workspace siap digunakan!");
\`\`\`

> *"Simplicity is the prerequisite for reliability."* — Edsger W. Dijkstra
`
  );

  // Statistics
  const stats = useMemo(() => {
    const chars = markdown.length;
    const trimmed = markdown.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const lines = markdown.split("\n").length;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).length : 0;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));
    return { chars, words, lines, paragraphs, readTimeMinutes };
  }, [markdown]);

  // Comprehensive GitHub Flavored Markdown (GFM) Renderer
  const renderedHtml = useMemo(() => {
    if (!markdown.trim()) {
      return '<div class="text-slate-600 italic text-center py-12">Belum ada konten markdown. Mulai ketik di editor sebelah kiri.</div>';
    }

    let html = markdown;

    // 1. Sanitize raw HTML tags to prevent XSS
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 2. Fenced Code Blocks (```lang ... ```)
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const trimmedCode = code.replace(/\n$/, "");
      return `<div class="my-4 rounded-2xl bg-[#050609] border border-slate-800/90 overflow-hidden shadow-xl">
        <div class="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400">
          <span class="font-bold text-indigo-400 uppercase">${lang || "code"}</span>
          <span class="text-[10px] text-slate-500">Clyra Syntax View</span>
        </div>
        <pre class="p-4 text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed"><code>${trimmedCode}</code></pre>
      </div>`;
    });

    // 3. Inline Code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-800/90 text-indigo-300 rounded-md text-xs font-mono border border-slate-700/60">$1</code>');

    // 4. GitHub Alerts (> [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > [!CAUTION])
    html = html.replace(/^&gt; \[\!NOTE\]\s*\n((?:^&gt; .*(?:\n|$))+)/gim, (_, content) => {
      const text = content.replace(/^&gt; ?/gim, "").trim();
      return `<div class="p-4 my-3 rounded-2xl bg-blue-950/30 border border-blue-500/40 text-blue-200 text-xs shadow-md"><strong class="font-bold block mb-1 text-blue-300">ℹ️ CATATAN (NOTE)</strong>${text}</div>`;
    });
    html = html.replace(/^&gt; \[\!TIP\]\s*\n((?:^&gt; .*(?:\n|$))+)/gim, (_, content) => {
      const text = content.replace(/^&gt; ?/gim, "").trim();
      return `<div class="p-4 my-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs shadow-md"><strong class="font-bold block mb-1 text-emerald-300">💡 TIPS</strong>${text}</div>`;
    });
    html = html.replace(/^&gt; \[\!WARNING\]\s*\n((?:^&gt; .*(?:\n|$))+)/gim, (_, content) => {
      const text = content.replace(/^&gt; ?/gim, "").trim();
      return `<div class="p-4 my-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs shadow-md"><strong class="font-bold block mb-1 text-amber-300">⚠️ PERINGATAN (WARNING)</strong>${text}</div>`;
    });

    // 5. Standard Blockquote (> text)
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-1.5 italic text-slate-300 bg-indigo-950/20 rounded-r-xl my-3 shadow-inner">$1</blockquote>');

    // 6. Headers (#, ##, ###, ####)
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-sm font-bold text-slate-200 mt-4 mb-2">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-white mt-5 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-6 mb-2 pb-1.5 border-b border-slate-800">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-white mt-4 mb-3 pb-2 border-b border-slate-800/80">$1</h1>');

    // 7. Horizontal Rule (---, ***, ___)
    html = html.replace(/^(?:---|___|\*\*\*)$/gim, '<hr class="my-6 border-slate-800" />');

    // 8. Markdown Tables (| Col 1 | Col 2 |)
    html = html.replace(/((?:^\|[^\n]+\|\r?\n)+)/gm, (tableMatch) => {
      const rows = tableMatch.trim().split("\n");
      if (rows.length < 2) return tableMatch;

      const headerCells = rows[0]
        .split("|")
        .filter((_, i, arr) => i > 0 && i < arr.length - 1)
        .map((c) => `<th class="p-3 text-left font-bold text-xs text-white bg-slate-900 border-b border-slate-800 font-mono">${c.trim()}</th>`)
        .join("");

      const bodyRows = rows.slice(2).map((row) => {
        const cells = row
          .split("|")
          .filter((_, i, arr) => i > 0 && i < arr.length - 1)
          .map((c) => `<td class="p-3 text-xs text-slate-300 border-b border-slate-800/60">${c.trim()}</td>`)
          .join("");
        return `<tr class="hover:bg-slate-900/40 transition-colors">${cells}</tr>`;
      }).join("");

      return `<div class="my-4 overflow-x-auto rounded-2xl border border-slate-800 bg-[#08090d] shadow-xl"><table class="w-full border-collapse"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
    });

    // 9. Task lists (- [x], - [ ])
    html = html.replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center gap-2.5 my-1.5 text-xs text-slate-200"><span class="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span><span class="line-through text-slate-500">$1</span></div>');
    html = html.replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center gap-2.5 my-1.5 text-xs text-slate-300"><span class="w-4 h-4 rounded bg-slate-900 border border-slate-700 flex items-center justify-center"></span><span>$1</span></div>');

    // 10. Unordered & Ordered Lists
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1 text-xs leading-relaxed">$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-slate-300 my-1 text-xs leading-relaxed">$1</li>');

    // 11. Links & Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-3 rounded-2xl border border-slate-800 max-w-full shadow-lg" />');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-indigo-400 hover:text-indigo-300 underline font-medium">$1</a>');

    // 12. Bold, Italic, Strikethrough
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-300">$1</em>');
    html = html.replace(/~~([^~]+)~~/g, '<span class="line-through text-slate-500">$1</span>');

    // 13. Paragraph line breaks
    html = html.replace(/\n\n/g, '<div class="h-3"></div>');

    return html;
  }, [markdown]);

  // Insert Markdown helper at cursor position
  const insertSyntax = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end) || placeholder;

    const newText =
      markdown.substring(0, start) +
      before +
      selected +
      after +
      markdown.substring(end);

    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 50);
  };

  // Copy helper
  const handleCopy = async (type: "md" | "html") => {
    try {
      const text = type === "md" ? markdown : renderedHtml;
      await navigator.clipboard.writeText(text);
      setCopiedKey(type);
      showToast(type === "md" ? "Markdown tersalin!" : "HTML tersalin!", "copied");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast("Gagal menyalin.", "error");
    }
  };

  // Download Markdown file (.md)
  const downloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clyra-doc-${Date.now().toString().slice(-4)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("File .md berhasil diunduh!", "success");
  };

  // Download Rendered HTML file (.html)
  const downloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Clyra Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #08090d; color: #e2e8f0; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1, h2, h3 { color: #ffffff; }
    pre { background: #050609; padding: 16px; border-radius: 12px; border: 1px solid #1e293b; color: #a5b4fc; overflow-x: auto; }
    code { font-family: monospace; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #334155; padding: 10px; text-align: left; }
    th { background: #0f172a; color: #fff; }
    blockquote { border-left: 4px solid #6366f1; padding-left: 16px; margin: 16px 0; color: #cbd5e1; background: rgba(99, 102, 241, 0.1); border-radius: 0 8px 8px 0; }
  </style>
</head>
<body>
  ${renderedHtml}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clyra-document-${Date.now().toString().slice(-4)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("File .html berhasil diunduh!", "success");
  };

  // Upload Local .md or .txt file
  const handleUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setMarkdown(content);
        showToast(`File "${file.name}" berhasil dimuat!`, "success");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Print / Save as PDF (Document only, without website UI)
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Izinkan pop-up peramban untuk mencetak dokumen!", "error");
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Clyra Markdown Document</title>
  <style>
    @page {
      margin: 15mm 20mm;
      size: A4 portrait;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.6;
      padding: 0;
      max-width: 800px;
      margin: 0 auto;
    }
    h1, h2, h3, h4 { color: #020617; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 24pt; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    h2 { font-size: 18pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    h3 { font-size: 14pt; }
    p { margin: 1em 0; }
    pre {
      background: #f8fafc !important;
      border: 1px solid #cbd5e1 !important;
      border-radius: 8px;
      padding: 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 9.5pt;
      overflow-x: auto;
      color: #0f172a !important;
      page-break-inside: avoid;
    }
    code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9.5pt;
      font-family: monospace;
      color: #4338ca;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 18px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: #f1f5f9 !important;
      font-weight: bold;
      color: #0f172a;
    }
    blockquote {
      border-left: 4px solid #6366f1;
      background: #f8fafc !important;
      padding: 10px 16px;
      margin: 16px 0;
      color: #334155;
      font-style: italic;
      border-radius: 0 8px 8px 0;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 24px 0;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  ${renderedHtml}
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 500);
    };
  </script>
</body>
</html>`);
    printWindow.document.close();
  };

  // Template Loader
  const loadTemplate = (type: "readme" | "changelog" | "spec" | "article") => {
    if (type === "readme") {
      setMarkdown(
`# Nama Proyek Modern 🚀

Deskripsi singkat, jelas, dan menarik mengenai apa yang dilakukan oleh proyek Anda.

## 📦 Panduan Instalasi
\`\`\`bash
# Clone repositori
git clone https://github.com/username/project.git

# Install dependencies
npm install

# Jalankan server lokal
npm run dev
\`\`\`

## ✨ Fitur Utama
- **⚡ Super Cepat**: Dibangun di atas fondasi teknologi modern.
- **🛡️ Aman & Andal**: Arsitektur type-safe dengan 100% test coverage.
- **📱 Responsif**: Tampilan sempurna di perangkat HP, tablet, maupun desktop.

## 📄 Lisensi
Didistribusikan di bawah Lisensi MIT. Lihat berkas \`LICENSE\` untuk informasi lengkap.
`
      );
    } else if (type === "changelog") {
      setMarkdown(
`# Catatan Rilis & Changelog 📋

Seluruh perubahan penting pada proyek akan dicatat secara berkala di dokumen ini.

## [v2.4.0] - 2026-08-23
### Ditambahkan
- ✨ Fitur ekspor berkas ke format PNG High-Res & HTML mandiri.
- 🎨 Dukungan tema Dark Matrix dan palet warna Tailwind 50-950.

### Diperbaiki
- 🐛 Memperbaiki masalah pemotongan teks (*clipping*) pada layar sempit.
- 🔒 Sanitasi ganda untuk mencegah injeksi XSS pada konten input.
`
      );
    } else if (type === "spec") {
      setMarkdown(
`# Spesifikasi Teknis & Arsitektur Sistem 📐

## 1. Ringkasan Eksekutif
Dokumen ini merinci arsitektur mikro-layanan untuk pipeline komputasi real-time.

## 2. Persyaratan Non-Fungsional
| Parameter | Target SLA | Catatan |
| :--- | :--- | :--- |
| **Response Latency** | < 50 ms | p99 di jaringan CDN |
| **Ketersediaan (Uptime)** | 99.99% | Multi-region failover |
| **Keamanan Data** | Zero Storage | Client-side ephemeral |

## 3. Diagram Alur
1. Pengguna memasukkan payload.
2. Web Crypto API memvalidasi signature.
3. Output dikirim secara instan ke UI.
`
      );
    } else {
      setMarkdown(
`# Menjelajahi Masa Depan Web Modern di Tahun 2026 🌐

*Ditulis oleh Tim Pengembang Clyra • Waktu baca: ~3 menit*

Dunia web development terus berevolusi menuju komputasi berbasis browser yang lebih cepat, aman, dan privat.

## Mengapa Client-Side Computing Sangat Penting?
Ketika kita memproses data langsung di sisi peramban (*client-side*), kita mendapatkan dua keuntungan masif:

1. **Privasi Pengguna Maksimal**: Tidak ada byte data yang meninggalkan perangkat pengguna.
2. **Efisiensi Biaya Server**: Beban komputasi terdistribusi langsung ke ribuan browser secara simultan.

> *"Performa terbaik adalah performa yang tidak perlu menunggu respon server."*
`
      );
    }
    showToast(`Template ${type.toUpperCase()} berhasil dimuat!`, "info");
  };

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Markdown Live Studio</h2>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                GFM &amp; Print Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Editor &amp; Live Render Markdown interaktif dengan GFM Tables, GitHub Alerts, dan Ekspor HTML / PDF.
            </p>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Switcher */}
          <div className="flex items-center bg-[#08090d] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("split")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                viewMode === "split" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split 50/50</span>
            </button>
            <button
              onClick={() => setViewMode("editor")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                viewMode === "editor" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                viewMode === "preview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
            onChange={handleUploadFile}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Upload File Markdown"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Cetak / Simpan PDF"
          >
            <Printer className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* 2. TEMPLATES & WYSIWYG TOOLBAR */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-4 shadow-xl space-y-3">
        {/* Template Selector Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Template Cepat:
            </span>
            {[
              { id: "readme", label: "📦 GitHub README" },
              { id: "changelog", label: "📋 Changelog" },
              { id: "spec", label: "📐 Tech Spec" },
              { id: "article", label: "📰 Artikel Blog" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => loadTemplate(t.id as any)}
                className="px-2.5 py-1 rounded-xl bg-[#08090d] hover:bg-slate-900 text-slate-300 text-xs font-mono border border-slate-800 transition-colors cursor-pointer"
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy("md")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
            >
              {copiedKey === "md" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Salin MD</span>
            </button>

            <button
              onClick={downloadMd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh .MD</span>
            </button>

            <button
              onClick={downloadHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export HTML</span>
            </button>
          </div>
        </div>

        {/* Quick Syntax Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1 text-slate-400">
          <button
            onClick={() => insertSyntax("**", "**", "teks tebal")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Tebal (Bold)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax("*", "*", "teks miring")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Miring (Italic)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax("~~", "~~", "teks dicoret")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Coret (Strikethrough)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          <button
            onClick={() => insertSyntax("# ", "", "Judul Utama H1")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax("## ", "", "Sub-Judul H2")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax("### ", "", "Topik H3")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          <button
            onClick={() => insertSyntax("- ", "", "Item daftar")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax("1. ", "", "Langkah pertama")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax("- [ ] ", "", "Tugas baru")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Task Checkbox"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          <button
            onClick={() => insertSyntax("> ", "", "Kutipan inspiratif")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Kutipan (Blockquote)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax("`", "`", "console.log('hi')")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Inline Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax("```typescript\n", "\n```", "// Tulis kode di sini")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Code Block"
          >
            <FileCode2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax("| Kolom 1 | Kolom 2 |\n| :--- | :--- |\n| Data A | Data B |")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Tabel GFM"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax("[", "](https://example.com)", "Teks Link")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Tautan Web (Link)"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax("![", "](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800)", "Deskripsi Gambar")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Gambar (Image)"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertSyntax("\n---\n")}
            className="p-2 rounded-lg bg-[#08090d] hover:bg-slate-800 hover:text-white border border-slate-800/80 transition-colors cursor-pointer"
            title="Garis Pemisah (Divider)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. WORKSPACE (EDITOR & PREVIEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: MARKDOWN INPUT EDITOR */}
        {(viewMode === "split" || viewMode === "editor") && (
          <div className={cn("bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4", viewMode === "editor" && "lg:col-span-2")}>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  Editor Markdown
                </span>

                <button
                  onClick={() => setMarkdown("")}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              </div>

              <textarea
                ref={textareaRef}
                rows={22}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Tulis markdown di sini..."
                className="w-full bg-[#08090d] border border-slate-800 rounded-2xl p-4 text-slate-100 text-xs font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed shadow-inner"
              />
            </div>

            <div className="text-[11px] text-slate-500 font-mono flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <span>{stats.words} kata • {stats.chars} karakter • {stats.lines} baris</span>
              <span className="text-indigo-400 font-bold">Est. Waktu Baca: ~{stats.readTimeMinutes} menit</span>
            </div>
          </div>
        )}

        {/* RIGHT: LIVE GFM RENDERED PREVIEW */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div className={cn("bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4", viewMode === "preview" && "lg:col-span-2")}>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  Live Rendered Preview
                </span>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800/40 font-bold">
                  ● Realtime DOM
                </span>
              </div>

              {/* Rendered HTML Container */}
              <div
                className="w-full min-h-[460px] max-h-[560px] bg-[#08090d] border border-slate-800 rounded-2xl p-6 text-xs text-slate-200 overflow-y-auto leading-relaxed shadow-inner selection:bg-indigo-600 selection:text-white"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>

            <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span>GFM HTML Preview</span>
              <button
                onClick={() => handleCopy("html")}
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === "html" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Salin Raw HTML</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

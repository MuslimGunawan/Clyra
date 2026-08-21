"use client";

import { useState, useMemo } from "react";
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  Code, 
  Sparkles, 
  Trash2,
  BookOpen
} from "lucide-react";

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState<string>(
`# Clyra Platform 🚀

Selamat datang di **Clyra Workspace**, pusat produktivitas dan arsip kreatif harian Anda.

## ✨ Fitur Utama
- **100% Client-Side Tools**: Tidak ada data yang dikirim ke server luar.
- **AI Prompt Vault**: Simpan prompt beserta preview visual.
- **Dark Minimalist Aesthetic**: Didesain dengan presisi dan performa tinggi.

### 📊 Contoh Tabel
| Modul | Status | Kategori |
| :--- | :--- | :--- |
| Converter | Ready | Utilitas |
| Prompts | Active | AI Gallery |
| Security | Ready | Dev Tools |

> *"Simplicity is the prerequisite for reliability."* — Edsger W. Dijkstra

\`\`\`typescript
const clyra = {
  name: "Clyra",
  mode: "dark-modern",
  speed: "instant",
};
console.log("Ready to build!");
\`\`\`
`
  );

  const [copied, setCopied] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const chars = markdown.length;
    const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
    const lines = markdown.split("\n").length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));
    return { chars, words, lines, readTimeMinutes };
  }, [markdown]);

  // Simple and safe markdown parser to HTML for preview
  const renderedHtml = useMemo(() => {
    let html = markdown
      // Escape HTML tags to prevent XSS
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks ```lang ... ```
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-[#050609] p-4 rounded-xl border border-slate-800 text-indigo-300 font-mono text-xs overflow-x-auto my-3"><code>${code.trim()}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-800 text-indigo-300 rounded text-xs font-mono">$1</code>');

    // Headers #, ##, ###
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-white mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-6 mb-2 pb-1 border-b border-slate-800">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-4 mb-3">$1</h1>');

    // Blockquote
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-1 italic text-slate-300 bg-indigo-950/20 rounded-r-lg my-3">$1</blockquote>');

    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-300">$1</em>');

    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>');

    // Line breaks
    html = html.replace(/\n\n/g, '<div class="h-3"></div>');

    return html;
  }, [markdown]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadTemplate = (type: "readme" | "changelog" | "spec") => {
    if (type === "readme") {
      setMarkdown(
`# Project Title

A concise description of what this project does and who it is for.

## 📦 Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## 🚀 Key Features
- Ultra fast performance
- Type-safe architecture
- Clean modern UI
`
      );
    } else if (type === "changelog") {
      setMarkdown(
`# Changelog

All notable changes to this project will be documented in this file.

## [v2.0.0] - 2026-08-19
### Added
- Image Compressor & Optimizer
- JSON Formatter & Validator
- Color Palette Studio
- Hash & UUID Generator

### Fixed
- Hydration warning on layout
`
      );
    } else {
      setMarkdown(
`# Technical Specification

## Overview
Architecture overview for the upcoming service module.

## Requirements
- Response time < 50ms
- Zero external tracking
- Offline fallback capability
`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Template:</span>
          <button
            onClick={() => loadTemplate("readme")}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition-colors"
          >
            README
          </button>
          <button
            onClick={() => loadTemplate("changelog")}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition-colors"
          >
            Changelog
          </button>
          <button
            onClick={() => loadTemplate("spec")}
            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition-colors"
          >
            Tech Spec
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadMd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Preview Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase font-mono">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                Markdown Input
              </span>
              <button
                onClick={() => setMarkdown("")}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                Hapus
              </button>
            </div>

            <textarea
              rows={18}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Tulis format markdown di sini..."
              className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-4 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>{stats.words} kata • {stats.chars} karakter</span>
            <span>Est. Baca: ~{stats.readTimeMinutes} menit</span>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase font-mono">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                Live Rendered HTML Preview
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                Realtime
              </span>
            </div>

            <div
              className="w-full min-h-[380px] max-h-[460px] bg-[#08090d] border border-slate-800 rounded-xl p-5 text-xs text-slate-300 overflow-y-auto leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>Formatted DOM Tree</span>
            <span>{stats.lines} Baris</span>
          </div>
        </div>
      </div>
    </div>
  );
}

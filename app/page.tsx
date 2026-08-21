"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Wrench, 
  Sparkles, 
  FolderGit2, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Compass,
  Check,
  Flame,
  Star,
  History,
  Crown,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { TOOLS } from "@/data/tools";
import { PROMPTS } from "@/data/prompts";
import { PROJECTS } from "@/data/projects";
import ToolCard from "@/components/ToolCard";
import PromptCard from "@/components/PromptCard";
import ProjectCard from "@/components/ProjectCard";
import PromptModal from "@/components/PromptModal";
import { PromptItem } from "@/lib/types";
import { 
  sortToolsByUsage, 
  getToolUsageMap, 
  getPinnedTools, 
  togglePinTool, 
  getRecentTools 
} from "@/lib/toolUsage";

export default function LandingPage() {
  const [activeModalPrompt, setActiveModalPrompt] = useState<PromptItem | null>(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [pinnedSlugs, setPinnedSlugs] = useState<string[]>([]);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [usageScores, setUsageScores] = useState<Record<string, number>>({});

  useEffect(() => {
    setPinnedSlugs(getPinnedTools());
    setRecentSlugs(getRecentTools());
    setUsageScores(getToolUsageMap());
  }, []);

  const handleTogglePin = (slug: string) => {
    const updated = togglePinTool(slug);
    setPinnedSlugs(updated);
  };

  const sortedTools = useMemo(() => {
    return sortToolsByUsage(TOOLS, "usage");
  }, []);

  const filteredTools = useMemo(() => {
    return sortedTools.filter((t) =>
      t.name.toLowerCase().includes(quickSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(quickSearch.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(quickSearch.toLowerCase()))
    );
  }, [sortedTools, quickSearch]);

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background glow and ambient grid */}
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <main className="relative z-10 flex-1">
        {/* HERO SECTION */}
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          {/* Pro Unlocked Highlight Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-8 shadow-lg backdrop-blur-md">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">PRO FEATURES UNLOCKED</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-300 font-semibold">100% Gratis Tanpa Batasan</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Semua Fitur Premium,{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Kini Gratis &amp; Tanpa Batas.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Tidak ada paywall, tidak ada batasan ukuran file harian, tanpa watermark, dan tanpa wajib daftar. Semua tools berjalan instan dan privat langsung di browser Anda.
          </p>

          {/* Quick Search bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Cari tool (e.g. compress, qr logo, typescript, prompt)..."
                className="w-full bg-[#0d0f18]/90 border border-slate-800/90 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xl transition-all"
              />
            </div>

            {quickSearch && (
              <div className="mt-3 p-4 bg-[#0e111a] border border-slate-800 rounded-2xl text-left space-y-2 shadow-2xl animate-fadeIn">
                <div className="text-[11px] font-mono text-slate-500 uppercase">
                  Hasil Pencarian ({filteredTools.length} tools ditemukan)
                </div>
                {filteredTools.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredTools.map((t) => (
                      <Link
                        key={t.id}
                        href={t.status === "ready" ? `/tools/${t.slug}` : "/tools"}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-xs transition-colors"
                      >
                        <span className="text-slate-200 font-medium">{t.name}</span>
                        <span className="text-[10px] font-mono text-indigo-400">
                          {t.status === "ready" ? "Buka" : "Segera"}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Tidak ada tool yang cocok.</p>
                )}
              </div>
            )}
          </div>

          {/* Quick CTA Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/tools"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all active:scale-95"
            >
              <Wrench className="w-4 h-4" />
              <span>Jelajahi Semua Tools ({TOOLS.length})</span>
            </Link>

            <Link
              href="/projects/prompts"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white text-sm font-medium border border-slate-800 hover:border-slate-700 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Galeri Prompt AI</span>
            </Link>
          </div>

          {/* Value Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Unlock className="w-4 h-4 text-emerald-400" />
              <span>100% Fitur Pro Unlocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Zero Server Tracking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Unlimited &amp; Vercel Ready</span>
            </div>
          </div>
        </section>

        {/* SECTION: CLYRA VS OTHER TOOLS (VALUE COMPARISON) */}
        <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0e111a]/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 uppercase font-bold">
                <Crown className="w-3.5 h-3.5" />
                <span>Kenapa Clyra Berbeda?</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Bebas dari Segala Batasan Berbayar
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Other websites */}
              <div className="p-5 rounded-xl bg-[#08090d] border border-slate-800 space-y-3">
                <div className="text-xs font-mono font-bold text-red-400 uppercase flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Web Tools Lain di Internet</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">✕</span> Batasan kompresi gambar max 5 MB atau limit harian.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">✕</span> QR code berbayar untuk logo kustom &amp; resolusi tinggi.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">✕</span> Data Anda diupload dan diproses di server pihak ketiga.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">✕</span> Wajib sign-up atau berlangganan bulanan.
                  </li>
                </ul>
              </div>

              {/* Clyra */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-950/30 to-emerald-950/20 border border-emerald-500/30 space-y-3 shadow-inner">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Clyra Platform</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Target KB &amp; kompresi unlimited langsung di browser.
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> QR Code HD + Sisipkan Logo sendiri 100% gratis.
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Privasi maksimal: 0% data terkirim ke server luar.
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> JSON ke TypeScript, Hash, Password gratis selamanya.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: TOOLS HUB (AUTO SORTED BY USAGE) */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Paling Sering Digunakan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Tools Produktivitas Pro
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Peringkat otomatis berdasarkan intensitas penggunaan harian Anda.
              </p>
            </div>

            <Link
              href="/tools"
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold group self-start sm:self-auto"
            >
              <span>Lihat Katalog Lengkap ({TOOLS.length} Tools)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedTools.slice(0, 6).map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isPinned={pinnedSlugs.includes(tool.slug)}
                onTogglePin={handleTogglePin}
                usageScore={usageScores[tool.slug]}
              />
            ))}
          </div>
        </section>

        {/* SECTION: AI PROMPTS VAULT */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prompt Showcase</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Koleksi Prompt &amp; Thumbnail AI
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Simpan dan gunakan prompt berkualitas lengkap dengan preview gambar hasil generate.
              </p>
            </div>

            <Link
              href="/projects/prompts"
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold group self-start sm:self-auto"
            >
              <span>Buka Galeri Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROMPTS.slice(0, 3).map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onOpenModal={(p) => setActiveModalPrompt(p)}
              />
            ))}
          </div>
        </section>

        {/* SECTION: WEB WORKS SHOWCASE */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Portofolio Web</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Karya &amp; Website yang Dibuat
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Kumpulan projek website dan aplikasi web yang telah dibangun.
              </p>
            </div>

            <Link
              href="/projects/web"
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold group self-start sm:self-auto"
            >
              <span>Lihat Semua Projek</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      </main>

      {/* Prompt Modal */}
      <PromptModal
        prompt={activeModalPrompt}
        onClose={() => setActiveModalPrompt(null)}
      />
    </div>
  );
}

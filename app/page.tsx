"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import DynamicLink from "@/components/DynamicLink";
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
  Crown, 
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
import { getStoredPrompts } from "@/lib/adminStore";
import { getStoredProjects } from "@/lib/adminStore";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LandingPage() {
  const { t } = useLanguage();
  const [activeModalPrompt, setActiveModalPrompt] = useState<PromptItem | null>(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [pinnedSlugs, setPinnedSlugs] = useState<string[]>([]);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [usageScores, setUsageScores] = useState<Record<string, number>>({});
  const [allPrompts, setAllPrompts] = useState<PromptItem[]>(PROMPTS);
  const [allProjects, setAllProjects] = useState(PROJECTS);

  useEffect(() => {
    setPinnedSlugs(getPinnedTools());
    setRecentSlugs(getRecentTools());
    setUsageScores(getToolUsageMap());
    setAllPrompts(getStoredPrompts());
    setAllProjects(getStoredProjects());

    const handlePromptUpdate = () => setAllPrompts(getStoredPrompts());
    const handleProjectUpdate = () => setAllProjects(getStoredProjects());

    window.addEventListener("clyra_prompts_updated", handlePromptUpdate);
    window.addEventListener("clyra_projects_updated", handleProjectUpdate);

    return () => {
      window.removeEventListener("clyra_prompts_updated", handlePromptUpdate);
      window.removeEventListener("clyra_projects_updated", handleProjectUpdate);
    };
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
            <span className="font-bold">{t("hero.badge_pro")}</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-300 font-semibold">{t("hero.badge_free")}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            {t("hero.title_main")}{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              {t("hero.title_highlight")} {t("hero.title_end")}
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t("hero.description")}
          </p>

          {/* Quick Search bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder={t("hero.input_placeholder")}
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
                    {filteredTools.map((toolItem) => (
                      <DynamicLink
                        key={toolItem.id}
                        href={toolItem.status === "ready" ? `/tools/${toolItem.slug}` : "/tools"}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-xs transition-colors"
                      >
                        <span className="text-slate-200 font-medium">{toolItem.name}</span>
                        <span className="text-[10px] font-mono text-indigo-400">
                          {toolItem.status === "ready" ? "Buka" : "Segera"}
                        </span>
                      </DynamicLink>
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
            <DynamicLink
              href="/tools"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all active:scale-95"
            >
              <Wrench className="w-4 h-4" />
              <span>{t("hero.btn_tools")} ({TOOLS.length})</span>
            </DynamicLink>

            <DynamicLink
              href="/projects/prompts"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white text-sm font-medium border border-slate-800 hover:border-slate-700 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{t("hero.btn_prompts")}</span>
            </DynamicLink>
          </div>

          {/* Value Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-emerald-400" />
              <span>{t("hero.feat_unlimited")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>{t("hero.feat_privacy")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{t("hero.feat_ready")}</span>
            </div>
          </div>
        </section>

        {/* SECTION: VALUE PROPOSITION COMPARISON CARD */}
        <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0c0e17] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{t("sec.diff_badge")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {t("sec.diff_title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Other Web Tools */}
              <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <div className="text-xs font-mono font-bold text-red-400 uppercase flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>{t("sec.other_tools_title")}</span>
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
                  <span>{t("sec.clyra_title")}</span>
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
                <span>{t("sec.trending_badge")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {t("sec.trending_title")}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {t("sec.trending_desc")}
              </p>
            </div>

            <DynamicLink
              href="/tools"
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold group self-start sm:self-auto"
            >
              <span>{t("sec.see_all_tools")} ({TOOLS.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </DynamicLink>
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
                <span>{t("sec.prompts_badge")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {t("sec.prompts_title")}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {t("sec.prompts_desc")}
              </p>
            </div>

            <DynamicLink
              href="/projects/prompts"
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold group self-start sm:self-auto"
            >
              <span>{t("sec.see_all_prompts")}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </DynamicLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPrompts.slice(0, 3).map((prompt) => (
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
                <span>{t("sec.web_badge")}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {t("sec.web_title")}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {t("sec.web_desc")}
              </p>
            </div>

            <DynamicLink
              href="/projects/web"
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold group self-start sm:self-auto"
            >
              <span>{t("sec.see_all_web")}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </DynamicLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProjects.slice(0, 3).map((project) => (
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

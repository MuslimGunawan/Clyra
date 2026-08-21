"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Wrench, 
  Sparkles, 
  Filter, 
  ArrowUpDown, 
  Star, 
  History,
  Flame
} from "lucide-react";
import { TOOLS, TOOL_CATEGORIES } from "@/data/tools";
import ToolCard from "@/components/ToolCard";
import { 
  sortToolsByUsage, 
  getToolUsageMap, 
  getPinnedTools, 
  togglePinTool, 
  getRecentTools 
} from "@/lib/toolUsage";
import Link from "next/link";

type SortMode = "usage" | "popular" | "alpha";

export default function ToolsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("usage");
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
    return sortToolsByUsage(TOOLS, sortMode);
  }, [sortMode]);

  const filteredTools = useMemo(() => {
    return sortedTools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [sortedTools, searchQuery, selectedCategory]);

  const pinnedToolsList = useMemo(() => {
    return TOOLS.filter((t) => pinnedSlugs.includes(t.slug));
  }, [pinnedSlugs]);

  const recentToolsList = useMemo(() => {
    return recentSlugs
      .map((slug) => TOOLS.find((t) => t.slug === slug))
      .filter(Boolean) as typeof TOOLS;
  }, [recentSlugs]);

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col">
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-4">
            <Wrench className="w-3.5 h-3.5" />
            <span>Tools Hub &amp; Smart Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Pusat Utilitas &amp; Tools Produktivitas
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed">
            Urutan tools disesuaikan secara otomatis berdasarkan frekuensi penggunaan harian Anda. 100% Client-side safe tanpa server delay.
          </p>
        </div>

        {/* Pinned & Recent Quick Bar */}
        {(pinnedToolsList.length > 0 || recentToolsList.length > 0) && (
          <div className="mb-8 p-4 bg-[#0e111a]/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            {/* Pinned Tools */}
            {pinnedToolsList.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-xs font-mono text-amber-400 flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Favorit:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {pinnedToolsList.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.slug}`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium whitespace-nowrap transition-colors"
                    >
                      <span>{tool.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Tools */}
            {recentToolsList.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1 shrink-0">
                  <History className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Terakhir:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {recentToolsList.slice(0, 3).map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.slug}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs whitespace-nowrap transition-colors"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-[#0e111a] border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-8 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tool (e.g. compress, qr, hash)..."
                className="w-full bg-[#08090d] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Sort Mode Switcher */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                <span>Urutan:</span>
              </span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-[#08090d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="usage">🔥 Paling Sering Digunakan</option>
                <option value="popular">✨ Default Rekomendasi</option>
                <option value="alpha">🔤 Nama (A - Z)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none pt-2 border-t border-slate-800/60">
            {TOOL_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isPinned={pinnedSlugs.includes(tool.slug)}
                onTogglePin={handleTogglePin}
                usageScore={usageScores[tool.slug]}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#0e111a] border border-slate-800/80 rounded-2xl">
            <p className="text-slate-400 text-sm">
              Tidak ada tool yang cocok dengan pencarian &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-3 text-xs text-indigo-400 hover:underline"
            >
              Reset filter
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

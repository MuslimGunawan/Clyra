"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Sparkles 
} from "lucide-react";
import { PROMPTS, PROMPT_CATEGORIES } from "@/data/prompts";
import { PromptItem } from "@/lib/types";
import PromptCard from "@/components/PromptCard";
import PromptModal from "@/components/PromptModal";
import { getStoredPrompts } from "@/lib/adminStore";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PromptsGalleryPage() {
  const { t } = useLanguage();
  const [promptsList, setPromptsList] = useState<PromptItem[]>(PROMPTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua Kategori");
  const [activeModalPrompt, setActiveModalPrompt] = useState<PromptItem | null>(null);

  const loadData = () => {
    setPromptsList(getStoredPrompts());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("clyra_prompts_updated", handleUpdate);
    return () => window.removeEventListener("clyra_prompts_updated", handleUpdate);
  }, []);

  const filteredPrompts = useMemo(() => {
    return promptsList.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.aiModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "Semua Kategori" ||
        item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [promptsList, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col">
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("prompts.page_badge")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t("prompts.page_title")}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed">
              {t("prompts.page_desc")}
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#0e111a] border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-8 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("prompts.search_placeholder")}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 w-full">
              {PROMPT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                      : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60"
                  }`}
                >
                  {cat === "Semua Kategori" ? t("prompts.filter_all") : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((item) => (
              <PromptCard
                key={item.id}
                item={item}
                onClick={() => setActiveModalPrompt(item)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#0e111a] border border-slate-800/80 rounded-2xl">
            <p className="text-slate-400 text-sm">
              Tidak ada prompt yang cocok dengan filter atau pencarian Anda.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Semua Kategori");
              }}
              className="mt-3 text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              Reset filter
            </button>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {activeModalPrompt && (
        <PromptModal
          prompt={activeModalPrompt}
          onClose={() => setActiveModalPrompt(null)}
        />
      )}
    </div>
  );
}

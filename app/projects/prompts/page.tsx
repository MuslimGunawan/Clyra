"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Sparkles, 
  Plus, 
  Download, 
  Upload, 
  RefreshCw 
} from "lucide-react";
import { PROMPTS, PROMPT_CATEGORIES } from "@/data/prompts";
import { PromptItem } from "@/lib/types";
import PromptCard from "@/components/PromptCard";
import PromptModal from "@/components/PromptModal";
import AddPromptModal from "@/components/AddPromptModal";

export default function PromptsGalleryPage() {
  const [promptsList, setPromptsList] = useState<PromptItem[]>(PROMPTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua Kategori");
  const [activeModalPrompt, setActiveModalPrompt] = useState<PromptItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load user saved prompts from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("clyra_custom_prompts");
      if (saved) {
        const customPrompts: PromptItem[] = JSON.parse(saved);
        setPromptsList([...customPrompts, ...PROMPTS]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleAddPrompt = (newPrompt: PromptItem) => {
    const updated = [newPrompt, ...promptsList];
    setPromptsList(updated);
    try {
      const currentCustom = JSON.parse(localStorage.getItem("clyra_custom_prompts") || "[]");
      localStorage.setItem("clyra_custom_prompts", JSON.stringify([newPrompt, ...currentCustom]));
    } catch (e) {
      console.error(e);
    }
  };

  const exportPromptsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(promptsList, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `clyra-prompts-backup-${Date.now()}.json`;
    a.click();
  };

  const filteredPrompts = useMemo(() => {
    return promptsList.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.aiModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

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
        {/* Header Section with Add Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Prompt Vault &amp; Gallery</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Koleksi Prompt &amp; Preview Hasil AI
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed">
              Penyimpanan prompt curated untuk Midjourney, DALL-E, Claude, dan GPT lengkap dengan visual preview thumbnail, parameter detail, serta fitur one-click copy.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={exportPromptsJSON}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
              title="Backup seluruh data prompt ke file JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup JSON</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Prompt</span>
            </button>
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
                placeholder="Cari prompt, model, atau tag..."
                className="w-full bg-[#08090d] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
              {PROMPT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onOpenModal={(p) => setActiveModalPrompt(p)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#0e111a] border border-slate-800/80 rounded-2xl">
            <p className="text-slate-400 text-sm">
              Tidak ada prompt yang cocok dengan pencarian &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Semua Kategori");
              }}
              className="mt-3 text-xs text-indigo-400 hover:underline"
            >
              Reset filter
            </button>
          </div>
        )}
      </main>

      {/* Prompt View Modal */}
      <PromptModal
        prompt={activeModalPrompt}
        onClose={() => setActiveModalPrompt(null)}
      />

      {/* Add New Prompt Modal */}
      <AddPromptModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPrompt={handleAddPrompt}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  RotateCcw, 
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";
import { PromptItem } from "@/lib/types";
import { 
  getStoredPrompts, 
  saveStoredPrompt, 
  deleteStoredPrompt, 
  resetPromptsToDefault 
} from "@/lib/adminStore";
import { useToast } from "@/components/ToastProvider";

const PROMPT_CATEGORIES = [
  "3D & Render",
  "Photography",
  "Anime & Art",
  "UI & Graphic",
  "Coding & Logic",
  "Writing",
] as const;

const AI_MODELS = [
  "Midjourney v6",
  "DALL-E 3",
  "Stable Diffusion XL",
  "Claude 3.5 Sonnet",
  "ChatGPT / GPT-4o",
  "FLUX.1",
];

export default function PromptManager() {
  const { showToast } = useToast();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Semua");
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<PromptItem>>({
    title: "",
    description: "",
    prompt: "",
    negativePrompt: "",
    thumbnail: "",
    aiModel: "Midjourney v6",
    category: "3D & Render",
    tags: [],
    parameters: { aspectRatio: "--ar 16:9", stylize: "--s 250", seed: "", chaos: "" },
  });
  const [tagInput, setTagInput] = useState("");

  const reloadPrompts = () => {
    setPrompts(getStoredPrompts());
  };

  useEffect(() => {
    reloadPrompts();
    const handleUpdate = () => reloadPrompts();
    window.addEventListener("clyra_prompts_updated", handleUpdate);
    return () => window.removeEventListener("clyra_prompts_updated", handleUpdate);
  }, []);

  const handleOpenAdd = () => {
    setEditingPrompt(null);
    setFormData({
      id: `prompt_${Date.now()}`,
      title: "",
      description: "",
      prompt: "",
      negativePrompt: "",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      aiModel: "Midjourney v6",
      category: "3D & Render",
      tags: ["prompt", "ai"],
      parameters: { aspectRatio: "--ar 16:9", stylize: "--s 250", seed: "", chaos: "" },
      createdAt: new Date().toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
    });
    setTagInput("prompt, ai");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PromptItem) => {
    setEditingPrompt(item);
    setFormData({ ...item });
    setTagInput((item.tags || []).join(", "));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Yakin ingin menghapus prompt "${title}"?`)) {
      deleteStoredPrompt(id);
      showToast("Prompt berhasil dihapus.", "info");
    }
  };

  const handleReset = () => {
    if (confirm("Reset semua prompt ke data default awal?")) {
      resetPromptsToDefault();
      showToast("Data prompt telah direset ke default.", "info");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.prompt?.trim()) {
      showToast("Judul dan Prompt Text wajib diisi!", "error");
      return;
    }

    const tagsArray = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const finalItem: PromptItem = {
      id: formData.id || `prompt_${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description?.trim() || "Koleksi prompt AI berkualitas.",
      prompt: formData.prompt.trim(),
      negativePrompt: formData.negativePrompt?.trim(),
      thumbnail: formData.thumbnail?.trim() || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      aiModel: formData.aiModel || "Midjourney v6",
      category: (formData.category as any) || "3D & Render",
      tags: tagsArray.length > 0 ? tagsArray : ["ai", "prompt"],
      parameters: formData.parameters || { aspectRatio: "--ar 16:9" },
      createdAt: formData.createdAt || new Date().toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
    };

    saveStoredPrompt(finalItem);
    setIsModalOpen(false);
    showToast(editingPrompt ? "Prompt berhasil diperbarui!" : "Prompt baru berhasil ditambahkan!", "success");
  };

  const filtered = prompts.filter((p) => {
    const matchCat = selectedCat === "Semua" || p.category === selectedCat;
    const matchSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.prompt.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Kelola AI Prompts Vault</h2>
            <p className="text-xs text-slate-400">Total: {prompts.length} Prompt tersimpan</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            title="Reset ke Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Prompt Baru</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, kata kunci, atau prompt..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="Semua">Semua Kategori</option>
          {PROMPT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Prompt Items Table / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-[#0c0e17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start gap-3">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-16 h-16 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-700/60"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                    {item.aiModel}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.category}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-mono text-[11px] bg-slate-950/60 p-1.5 rounded border border-slate-900">
                  {item.prompt}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map((t) => (
                  <span key={t} className="text-[10px] text-slate-500 font-mono">#{t}</span>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 transition-colors"
                  title="Edit Prompt"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-300 hover:text-red-400 transition-colors"
                  title="Hapus Prompt"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0a0c13] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingPrompt ? "Edit Prompt AI" : "Tambah Prompt AI Baru"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Judul Prompt *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Cyberpunk Neon Samurai 3D"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">AI Model</label>
                  <select
                    value={formData.aiModel || "Midjourney v6"}
                    onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                  >
                    {AI_MODELS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Kategori</label>
                  <select
                    value={formData.category || "3D & Render"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                  >
                    {PROMPT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Isi Prompt Text Utama *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.prompt || ""}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Ketik teks instruksi prompt..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Negative Prompt (Opsional)</label>
                <input
                  type="text"
                  value={formData.negativePrompt || ""}
                  onChange={(e) => setFormData({ ...formData, negativePrompt: e.target.value })}
                  placeholder="e.g. blurry, low quality, watermark"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">URL Gambar Thumbnail *</label>
                <input
                  type="url"
                  required
                  value={formData.thumbnail || ""}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Tags (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="cyberpunk, neon, samurai, octane"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Prompt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

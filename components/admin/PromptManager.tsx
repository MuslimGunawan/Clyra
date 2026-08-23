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
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  Eye
} from "lucide-react";
import { PromptItem } from "@/lib/types";
import { 
  getStoredPrompts, 
  saveStoredPrompt, 
  deleteStoredPrompt, 
  resetPromptsToDefault 
} from "@/lib/adminStore";
import { useToast } from "@/components/ToastProvider";
import DestructiveConfirmModal from "./DestructiveConfirmModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

const PROMPT_CATEGORIES = [
  "Photography",
  "3D & Render",
  "Anime & Art",
  "UI & Graphic",
  "Coding & Logic",
  "Writing",
] as const;

const AI_MODELS = [
  "FLUX.1 / Midjourney",
  "Nano Banana Pro",
  "Midjourney v6",
  "DALL-E 3",
  "Stable Diffusion XL",
  "Claude 3.5 Sonnet",
  "ChatGPT / GPT-4o",
  "Google Imagen 3",
];

export default function PromptManager() {
  const { showToast } = useToast();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Semua");
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Thumbnail mode: "upload" or "url"
  const [thumbnailMode, setThumbnailMode] = useState<"url" | "upload">("url");

  // Form State
  const [formData, setFormData] = useState<Partial<PromptItem>>({
    title: "",
    description: "",
    prompt: "",
    thumbnail: "",
    aiModel: "FLUX.1 / Midjourney",
    category: "Photography",
    tags: [],
    parameters: { aspectRatio: "9:16", stylize: "50" },
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
      thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
      aiModel: "FLUX.1 / Midjourney",
      category: "Photography",
      tags: ["Realistic", "Smartphone POV"],
      parameters: { aspectRatio: "9:16", stylize: "50" },
      createdAt: new Date().toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
    });
    setTagInput("Realistic, Smartphone POV");
    setThumbnailMode("url");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PromptItem) => {
    setEditingPrompt(item);
    setFormData({ ...item });
    setTagInput((item.tags || []).join(", "));
    setThumbnailMode(item.thumbnail?.startsWith("data:") ? "upload" : "url");
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteTarget({ id, title });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredPrompt(deleteTarget.id);
    showToast(`Prompt "${deleteTarget.title}" berhasil dihapus.`, "info");
    setDeleteTarget(null);
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    resetPromptsToDefault();
    showToast("Seluruh data prompt berhasil direset ke pengaturan awal pabrik!", "info");
    setShowResetModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran file maksimal 5MB!", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, thumbnail: result }));
        showToast("Gambar berhasil dimuat dari file!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.prompt?.trim()) {
      showToast("Judul dan Isi Prompt Text wajib diisi!", "error");
      return;
    }

    const tagsArray = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const finalItem: PromptItem = {
      id: formData.id || `prompt_${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description?.trim() || "Koleksi prompt AI berkualitas tinggi.",
      prompt: formData.prompt.trim(),
      thumbnail: formData.thumbnail?.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
      aiModel: formData.aiModel || "FLUX.1 / Midjourney",
      category: (formData.category as any) || "Photography",
      tags: tagsArray.length > 0 ? tagsArray : ["ai", "prompt"],
      parameters: formData.parameters || { aspectRatio: "9:16" },
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari prompt berdasarkan judul, instruksi, atau tag..."
            className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCat("Semua")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              selectedCat === "Semua"
                ? "bg-indigo-600 text-white"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Semua
          </button>
          {PROMPT_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
                selectedCat === c
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Prompts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-[#0c0e17] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-all shadow-md"
          >
            <div>
              {/* Thumbnail */}
              <div className="relative h-44 bg-slate-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e17] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-600/80 text-white backdrop-blur-md">
                    {item.aiModel}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900/80 text-slate-300 border border-slate-700/60 backdrop-blur-md">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Prompt Preview */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 text-[11px] font-mono line-clamp-3 leading-relaxed">
                  {item.prompt}
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 py-3 border-t border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.tags.slice(0, 2).map((t) => (
                  <span key={t} className="text-[10px] text-slate-500 font-mono">#{t}</span>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 transition-colors cursor-pointer"
                  title="Edit Prompt"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
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

          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0a0c13] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingPrompt ? "Edit Prompt AI" : "Tambah Prompt AI Baru"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Judul Prompt *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Candid Hijab Cafe & Flower Bouquet"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">AI Model Engine</label>
                  <select
                    value={formData.aiModel || "FLUX.1 / Midjourney"}
                    onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                  >
                    {AI_MODELS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Kategori Visual</label>
                  <select
                    value={formData.category || "Photography"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                  >
                    {PROMPT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Main Prompt Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium block">
                    Isi Lengkap Prompt (Positif, Negatif, Spek Kamera &amp; Detail) *
                  </label>
                  <span className="text-[10px] text-indigo-400 font-mono">Format Bebas / Lengkap</span>
                </div>
                <textarea
                  required
                  rows={6}
                  value={formData.prompt || ""}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Masukkan instruksi prompt detail, deskripsi subjek, pose, lighting, spek kamera, dan instruksi hal yang dihindari (negatif)..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none font-mono text-[11px] leading-relaxed"
                />
              </div>

              {/* 2-Option Thumbnail Selector (Upload vs URL/ImgBB) */}
              <div className="space-y-2 p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                    Thumbnail Preview Gambar
                  </span>

                  {/* Toggle Pill */}
                  <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setThumbnailMode("url")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                        thumbnailMode === "url"
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>URL (ImgBB)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnailMode("upload")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                        thumbnailMode === "upload"
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload File</span>
                    </button>
                  </div>
                </div>

                {thumbnailMode === "url" ? (
                  <div className="space-y-1.5 pt-1">
                    <input
                      type="url"
                      required
                      value={formData.thumbnail || ""}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      placeholder="https://i.ibb.co/... atau URL gambar langsung"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-slate-500 font-mono">
                      Contoh: Masukkan direct image link dari ImgBB, Unsplash, atau CDN gambar Anda.
                    </p>
                  </div>
                ) : (
                  <div className="pt-1">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-4 cursor-pointer bg-slate-950/60 transition-colors">
                      <Upload className="w-5 h-5 text-indigo-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-300">Pilih gambar dari perangkat</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 font-mono">PNG, JPG, WEBP (Maks 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Live Preview */}
                {formData.thumbnail && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
                    <div className="w-16 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.thumbnail}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      <span className="text-emerald-400 font-bold">✓ Preview Siap:</span> {formData.thumbnail.slice(0, 45)}...
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Tags (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Photography, Smartphone POV, Realistic, Candid"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30 active:scale-95 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Prompt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* High Security Destructive Reset Confirmation Modal */}
      <DestructiveConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
        title="Reset Default AI Prompts"
        description="Anda akan mengembalikan seluruh database koleksi prompt AI ke data bawaan awal. Seluruh prompt baru yang Anda buat atau modifikasi akan terhapus."
        confirmButtonText="Konfirmasi & Reset Prompts"
      />

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Prompt AI"
        itemTitle={deleteTarget?.title}
        itemType="Prompt"
      />
    </div>
  );
}

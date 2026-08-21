"use client";

import { useState, ChangeEvent } from "react";
import { X, Sparkles, Plus, Image as ImageIcon, Upload } from "lucide-react";
import { PromptItem } from "@/lib/types";

interface AddPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPrompt: (newPrompt: PromptItem) => void;
}

export default function AddPromptModal({ isOpen, onClose, onAddPrompt }: AddPromptModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [promptText, setPromptText] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aiModel, setAiModel] = useState("Midjourney v6");
  const [category, setCategory] = useState<PromptItem["category"]>("UI & Graphic");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [tags, setTags] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");

  if (!isOpen) return null;

  const handleImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setThumbnailUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !promptText) return;

    const newPrompt: PromptItem = {
      id: `custom-prompt-${Date.now()}`,
      title,
      description: description || "Prompt kustom dari koleksi personal Clyra.",
      prompt: promptText,
      negativePrompt: negativePrompt || undefined,
      thumbnail:
        thumbnailUrl ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      aiModel,
      category,
      tags: tags
        ? tags.split(",").map((t) => t.trim())
        : ["Custom", category],
      parameters: {
        aspectRatio: aspectRatio || "16:9",
      },
      createdAt: new Date().toISOString().split("T")[0],
    };

    onAddPrompt(newPrompt);
    onClose();
    // Reset form
    setTitle("");
    setDescription("");
    setPromptText("");
    setNegativePrompt("");
    setThumbnailUrl("");
    setTags("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0d0f17] border border-slate-800 rounded-2xl shadow-2xl z-10 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Tambah Prompt AI Baru</h2>
              <p className="text-xs text-slate-400">Simpan prompt &amp; thumbnail hasil karya Anda</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Judul Prompt *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Futuristic Cyberpunk Hacker Desk 3D"
              className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">AI Model</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
              >
                <option value="Midjourney v6">Midjourney v6</option>
                <option value="DALL-E 3">DALL-E 3</option>
                <option value="Stable Diffusion XL">Stable Diffusion XL</option>
                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                <option value="ChatGPT (GPT-4o)">ChatGPT (GPT-4o)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
              >
                <option value="UI & Graphic">UI & Graphic</option>
                <option value="3D & Render">3D & Render</option>
                <option value="Photography">Photography</option>
                <option value="Coding & Logic">Coding & Logic</option>
                <option value="Anime & Art">Anime & Art</option>
                <option value="Writing">Writing</option>
              </select>
            </div>
          </div>

          {/* Prompt Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Prompt Command *</label>
            <textarea
              rows={3}
              required
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Tulis atau tempel teks prompt di sini..."
              className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Negative Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Negative Prompt (Opsional)</label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="e.g. blurry, low quality, oversaturated"
              className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none"
            />
          </div>

          {/* Thumbnail source: URL or Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Thumbnail Preview (URL atau Upload)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... atau pilih file"
                className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
              />
              <label className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Tags & Aspect ratio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tags (pisahkan koma)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Cyberpunk, 3D, Workspace, Dark"
                className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Aspect Ratio</label>
              <input
                type="text"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                placeholder="16:9, 1:1, 9:16"
                className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan ke Vault</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

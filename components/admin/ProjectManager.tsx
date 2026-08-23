"use client";

import { useState, useEffect } from "react";
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  RotateCcw, 
  ExternalLink,
  Star
} from "lucide-react";
import { ProjectItem } from "@/lib/types";
import { 
  getStoredProjects, 
  saveStoredProject, 
  deleteStoredProject, 
  resetProjectsToDefault 
} from "@/lib/adminStore";
import { useToast } from "@/components/ToastProvider";
import DestructiveConfirmModal from "./DestructiveConfirmModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

const PROJECT_CATEGORIES = [
  "Web App",
  "Landing Page",
  "Tool",
  "Open Source",
  "Client Project",
] as const;

export default function ProjectManager() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Semua");
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ProjectItem>>({
    title: "",
    description: "",
    thumbnail: "",
    category: "Web App",
    techStack: [],
    liveUrl: "",
    githubUrl: "",
    featured: false,
    year: new Date().getFullYear().toString(),
  });
  const [techInput, setTechInput] = useState("");

  const reloadProjects = () => {
    setProjects(getStoredProjects());
  };

  useEffect(() => {
    reloadProjects();
    const handleUpdate = () => reloadProjects();
    window.addEventListener("clyra_projects_updated", handleUpdate);
    return () => window.removeEventListener("clyra_projects_updated", handleUpdate);
  }, []);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      id: `proj_${Date.now()}`,
      title: "",
      description: "",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
      category: "Web App",
      techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
      liveUrl: "",
      githubUrl: "",
      featured: false,
      year: new Date().getFullYear().toString(),
    });
    setTechInput("Next.js, TypeScript, Tailwind CSS");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProjectItem) => {
    setEditingProject(item);
    setFormData({ ...item });
    setTechInput((item.techStack || []).join(", "));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteTarget({ id, title });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteStoredProject(deleteTarget.id);
    showToast(`Projek "${deleteTarget.title}" berhasil dihapus.`, "info");
    setDeleteTarget(null);
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    resetProjectsToDefault();
    showToast("Seluruh data projek web berhasil direset ke pengaturan awal pabrik!", "info");
    setShowResetModal(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      showToast("Judul projek wajib diisi!", "error");
      return;
    }

    const techArray = techInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const finalItem: ProjectItem = {
      id: formData.id || `proj_${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description?.trim() || "Aplikasi web modern dan performan tinggi.",
      thumbnail: formData.thumbnail?.trim() || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
      category: (formData.category as any) || "Web App",
      techStack: techArray.length > 0 ? techArray : ["Next.js", "TypeScript"],
      liveUrl: formData.liveUrl?.trim() || undefined,
      githubUrl: formData.githubUrl?.trim() || undefined,
      featured: Boolean(formData.featured),
      year: formData.year || new Date().getFullYear().toString(),
    };

    saveStoredProject(finalItem);
    setIsModalOpen(false);
    showToast(editingProject ? "Projek berhasil diperbarui!" : "Projek baru berhasil ditambahkan!", "success");
  };

  const filtered = projects.filter((p) => {
    const matchCat = selectedCat === "Semua" || p.category === selectedCat;
    const matchSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Kelola Portofolio Web Works</h2>
            <p className="text-xs text-slate-400">Total: {projects.length} Projek Web tersimpan</p>
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
            <span>Tambah Projek Baru</span>
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
            placeholder="Cari judul projek, deskripsi, atau teknologi..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="Semua">Semua Kategori</option>
          {PROJECT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
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
                className="w-20 h-16 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-700/60"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.category}
                  </span>
                  {item.featured && (
                    <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>Featured</span>
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono ml-auto">{item.year}</span>
                </div>
                <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex flex-wrap gap-1">
                {item.techStack.slice(0, 3).map((t) => (
                  <span key={t} className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-mono">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                {item.liveUrl && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Buka Demo"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 transition-colors"
                  title="Edit Projek"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600/30 text-slate-300 hover:text-red-400 transition-colors"
                  title="Hapus Projek"
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
                {editingProject ? "Edit Projek Web" : "Tambah Projek Web Baru"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Judul Projek *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Clyra Workspace"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Kategori</label>
                  <select
                    value={formData.category || "Web App"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                  >
                    {PROJECT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Tahun Rilis</label>
                  <input
                    type="text"
                    value={formData.year || "2026"}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Deskripsi Projek</label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Penjelasan fitur dan fungsi projek..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
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
                <label className="text-slate-300 font-medium block mb-1">Tech Stack (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="Next.js, TypeScript, Tailwind, Web Crypto"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Live Demo URL (Opsional)</label>
                  <input
                    type="url"
                    value={formData.liveUrl || ""}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">GitHub Repo URL (Opsional)</label>
                  <input
                    type="url"
                    value={formData.githubUrl || ""}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-indigo-500 outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={Boolean(formData.featured)}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="featuredToggle" className="text-slate-300 font-medium cursor-pointer">
                  Tampilkan sebagai Featured di Halaman Utama
                </label>
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
                  <span>Simpan Projek</span>
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
        title="Reset Default Web Works"
        description="Anda akan mengembalikan seluruh database koleksi projek web ke data bawaan awal. Seluruh projek baru yang Anda buat atau modifikasi akan terhapus."
        confirmButtonText="Konfirmasi & Reset Projek"
      />

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Projek Web"
        itemTitle={deleteTarget?.title}
        itemType="Projek Web"
      />
    </div>
  );
}

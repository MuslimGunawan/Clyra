"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  BookOpen, 
  Code2, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  LogOut, 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  Layers, 
  Search, 
  ChevronRight,
  RefreshCw,
  FolderLock,
  Lock,
  ArrowLeft
} from "lucide-react";
import DynamicLink from "@/components/DynamicLink";
import { useToast } from "@/components/ToastProvider";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ADMIN_MASTER_EMAIL } from "@/lib/memberAuth";

interface Product {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  category: "Ebook" | "Script" | "Prompt Pack" | "Tool" | "Course";
  cover_image?: string;
  version?: string;
  badge?: string;
  download_url?: string;
  content_body?: string;
  orderId?: string;
  grantedAt?: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

interface MemberProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_login_at: string;
  role?: string;
}

export default function MemberWorkspacePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "notes">("products");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Product Viewer Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Note Modal State
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const fetchWorkspaceData = async () => {
    const token = localStorage.getItem("clyra_member_token");
    if (!token) {
      router.push("/member/login");
      return;
    }

    try {
      const res = await fetch("/api/member/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setProfile(data.member);
        setProducts(data.products || []);
        setNotes(data.notes || []);
        setIsAdmin(Boolean(data.isAdmin || data.member?.role === "admin" || data.member?.email === ADMIN_MASTER_EMAIL));
      } else {
        localStorage.removeItem("clyra_member_token");
        showToast("Sesi login berakhir. Silakan login kembali.", "info");
        router.push("/member/login");
      }
    } catch {
      showToast("Gagal memuat data workspace", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("clyra_member_token");
    localStorage.removeItem("clyra_member_email");
    localStorage.removeItem("clyra_member_name");
    showToast("Anda telah keluar dari sesi member.", "info");
    router.push("/");
  };

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    showToast("Konten berhasil disalin ke clipboard!", "success");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote?.title?.trim()) {
      showToast("Judul catatan wajib diisi", "error");
      return;
    }

    const token = localStorage.getItem("clyra_member_token");
    try {
      const res = await fetch("/api/member/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editingNote.id,
          title: editingNote.title.trim(),
          content: editingNote.content || "",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(editingNote.id ? "Catatan diperbarui!" : "Catatan baru disimpan!", "success");
        setIsNoteModalOpen(false);
        fetchWorkspaceData();
      } else {
        showToast(data.error || "Gagal menyimpan catatan", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Hapus catatan ini dari workspace Anda?")) return;
    const token = localStorage.getItem("clyra_member_token");
    try {
      const res = await fetch(`/api/member/notes?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("Catatan dihapus.", "info");
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }
    } catch {
      showToast("Gagal menghapus catatan", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-slate-400 font-mono text-xs space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
        <span>Menghubungkan ke Cloud Workspace...</span>
      </div>
    );
  }

  const categories = ["Semua", "Ebook", "Script", "Prompt Pack", "Course", "Tool"];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-20 bg-[#0a0d16]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DynamicLink href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-black text-sm">
                C
              </div>
              <span className="text-base font-extrabold text-white tracking-wider">
                CLYRA <span className="text-indigo-400 font-mono text-xs">{t("member.vault_badge")}</span>
              </span>
            </DynamicLink>

            {isAdmin ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 text-[10px] font-mono font-bold">
                👑 Master Admin Unlocked
              </span>
            ) : (
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[10px] font-mono">
                ● Cloud Sync Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {isAdmin && (
              <DynamicLink
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/50 text-purple-200 text-xs font-semibold transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Vault</span>
              </DynamicLink>
            )}

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{profile?.full_name || "Member Clyra"}</div>
              <div className="text-[10px] text-slate-400 font-mono">{profile?.email}</div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/50 text-slate-400 hover:text-red-300 text-xs transition-colors cursor-pointer"
              title={t("member.logout")}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("member.logout")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ADMIN MASTER BANNER (If logged in as admin) */}
        {isAdmin && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/90 to-slate-950 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl shadow-purple-950/20 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                <ShieldCheck className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">👑 Mode Preview Master Admin Aktif</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-700/60 font-bold">
                    SEMUA TERBUKA (ALL UNLOCKED)
                  </span>
                </div>
                <p className="text-xs text-purple-200/80 mt-0.5 leading-relaxed">
                  Anda memiliki akses penuh untuk membuka seluruh Ebook Reader, Script Hub, Source Code, dan Catatan Cloud tanpa batasan transaksi.
                </p>
              </div>
            </div>

            <DynamicLink
              href="/admin"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all active:scale-95 whitespace-nowrap self-stretch sm:self-auto justify-center"
            >
              <span>⚙️ Kelola di Admin Vault</span>
            </DynamicLink>
          </div>
        )}

        {/* Welcome Header */}
        <div className="bg-[#0c0e18] border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  {t("member.workspace_title")}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Multi-Device Sync
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Halo, {profile?.full_name || "Member"}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                {t("member.workspace_desc")}
              </p>
            </div>

            {/* Quick Stats Box */}
            <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white font-mono">{products.length}</div>
                <div className="text-[10px] text-slate-400 font-mono">{t("member.my_products")}</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "products"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t("member.my_products")} ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "notes"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t("member.notes_title")} ({notes.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: MY PRODUCTS */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Search & Category Filter Bar */}
            <div className="bg-[#0c0e18] border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari dalam koleksi produk Anda..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5 w-full">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm"
                          : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#0c0e18] border border-slate-800 text-center space-y-3">
                <FolderLock className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-white">Belum Ada Produk yang Terhubung</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {isAdmin
                    ? "Belum ada produk dibuat di Supabase. Anda dapat menambahkan produk baru di tab Admin Vault."
                    : "Jika Anda baru saja membeli di Lynk.id, pastikan Anda menggunakan link aktivasi yang dikirimkan ke email Anda."}
                </p>
                {isAdmin && (
                  <DynamicLink
                    href="/admin"
                    className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold mt-2"
                  >
                    + Buat Produk di Admin Vault
                  </DynamicLink>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#0c0e18] border border-slate-800 hover:border-indigo-500/40 rounded-3xl overflow-hidden flex flex-col justify-between group transition-all shadow-lg"
                  >
                    <div>
                      {/* Thumbnail Header */}
                      <div className="relative h-48 bg-slate-900 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.cover_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e18] via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white backdrop-blur-md">
                            {p.badge || p.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-950/80 text-emerald-400 border border-slate-700 backdrop-blur-md">
                            ✓ {isAdmin ? "Master Access" : "Akses Permanen"}
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-5 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span className="text-indigo-300 font-semibold">{p.category}</span>
                          <span>•</span>
                          <span className="text-slate-400">{p.version || "v1.0.0"}</span>
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                          {p.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-5 pt-0 flex items-center justify-between gap-3">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
                      >
                        {p.category === "Ebook" ? <BookOpen className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                        <span>
                          {p.category === "Ebook"
                            ? "Buka Ebook Reader"
                            : p.category === "Prompt Pack"
                            ? "Buka Prompt Library"
                            : "Buka Script & Hub"}
                        </span>
                      </button>

                      {p.download_url && (
                        <a
                          href={p.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                          title="Download File Asli (.PDF / .ZIP)"
                        >
                          <Download className="w-4 h-4 text-emerald-400" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY NOTES */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Catatan cloud pribadi Anda. Tersinkronisasi otomatis saat Anda login dari perangkat mana pun.
              </p>
              <button
                onClick={() => {
                  setEditingNote({ title: "", content: "" });
                  setIsNoteModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Catatan Baru</span>
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#0c0e18] border border-slate-800 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-white">Belum Ada Catatan</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Gunakan fitur ini untuk menyimpan prompt favorit, konfigurasi API key, atau catatan belajar Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-5 rounded-2xl bg-[#0c0e18] border border-slate-800 flex flex-col justify-between gap-3 group hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white line-clamp-1">{n.title}</h4>
                        <button
                          onClick={() => handleDeleteNote(n.id)}
                          className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-4 font-mono leading-relaxed whitespace-pre-wrap">
                        {n.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{new Date(n.updated_at).toLocaleDateString("id-ID")}</span>
                      <button
                        onClick={() => {
                          setEditingNote(n);
                          setIsNoteModalOpen(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                      >
                        Edit Catatan →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* PRODUCT CONTENT VIEWER & EBOOK READER MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setSelectedProduct(null)} />

          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0a0d16] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 space-y-6 z-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                    {selectedProduct.category}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">
                    {selectedProduct.version || "v1.0.0"}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                      ADMIN OVERRIDE
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                  {selectedProduct.title}
                </h2>
                {selectedProduct.tagline && (
                  <p className="text-xs text-slate-400 mt-0.5">{selectedProduct.tagline}</p>
                )}
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Isi Materi, Source Code &amp; Prompt Command
                </span>

                <button
                  onClick={() => handleCopyContent(selectedProduct.content_body || "")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "Tersalin!" : "Salin Semua"}</span>
                </button>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-[#06080d] border border-slate-800 text-slate-200 text-xs sm:text-sm font-mono leading-relaxed select-all whitespace-pre-wrap max-h-96 overflow-y-auto">
                {selectedProduct.content_body || "Konten materi sedang diproses..."}
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-mono">
                Order ID: {selectedProduct.orderId || "ADMIN_MASTER_OVERRIDE"}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {selectedProduct.download_url && (
                  <a
                    href={selectedProduct.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File (.PDF / .ZIP)</span>
                  </a>
                )}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTE EDIT MODAL */}
      {isNoteModalOpen && editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setIsNoteModalOpen(false)} />

          <div className="relative w-full max-w-md bg-[#0c0e18] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {editingNote.id ? "Edit Catatan" : "Tambah Catatan Baru"}
              </h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Judul Catatan</label>
                <input
                  type="text"
                  required
                  value={editingNote.title || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  placeholder="e.g. Ide Script Instagram Bot"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Isi Catatan / Snippet</label>
                <textarea
                  rows={5}
                  value={editingNote.content || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  placeholder="Tulis kode, prompt, atau catatan di sini..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-slate-300 text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-4 py-6 text-center text-xs text-slate-600 font-mono">
        © {new Date().getFullYear()} Clyra Platform • Multi-Device Cloud Workspace.
      </footer>
    </div>
  );
}

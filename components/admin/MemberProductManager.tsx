"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  Code2, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  ShieldCheck, 
  RefreshCw, 
  KeyRound, 
  Search, 
  Check, 
  Copy, 
  ExternalLink,
  Layers,
  Lock,
  Mail,
  UserCheck
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface Member {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_login_at: string;
  status: string;
}

interface Product {
  id: string;
  title: string;
  tagline?: string;
  description?: string;
  category: string;
  cover_image?: string;
  version?: string;
  badge?: string;
  download_url?: string;
  content_body?: string;
}

interface AccessRow {
  id: string;
  member_email: string;
  product_id: string;
  order_id: string;
  granted_at: string;
  source: string;
  clyra_products?: {
    id: string;
    title: string;
    category: string;
  };
}

export default function MemberProductManager() {
  const { showToast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [accessList, setAccessList] = useState<AccessRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subTab, setSubTab] = useState<"members" | "products">("members");
  const [search, setSearch] = useState("");

  // Modals State
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [grantData, setGrantData] = useState({ email: "", productId: "", passkey: "" });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productData, setProductData] = useState<Partial<Product> & { passkey?: string }>({
    id: "",
    title: "",
    tagline: "",
    description: "",
    category: "Ebook",
    cover_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    version: "v1.0.0",
    badge: "PRODUK DIGITAL",
    download_url: "",
    content_body: "",
    passkey: "",
  });

  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [memRes, prodRes] = await Promise.all([
        fetch("/api/admin/members"),
        fetch("/api/admin/products"),
      ]);

      const memData = await memRes.json();
      const prodData = await prodRes.json();

      if (memData.success) {
        setMembers(memData.members || []);
        setAccessList(memData.access || []);
      }
      if (prodData.success) {
        setProducts(prodData.products || []);
      }
    } catch {
      showToast("Gagal memuat data member & produk", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantData.email || !grantData.productId || !grantData.passkey) {
      showToast("Email, Produk, dan Password Admin wajib diisi!", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grantData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, "success");
        setIsGrantModalOpen(false);
        setGrantData({ email: "", productId: "", passkey: "" });
        fetchData();
      } else {
        showToast(data.error || "Gagal memberikan akses", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    }
  };

  const handleRevokeAccess = async (accessId: string, email: string) => {
    if (!confirm(`Yakin ingin mencabut akses produk ini dari ${email}?`)) return;

    try {
      const res = await fetch(`/api/admin/members?accessId=${accessId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Akses produk berhasil dicabut.", "info");
        fetchData();
      }
    } catch {
      showToast("Gagal mencabut akses", "error");
    }
  };

  const handleDeleteMember = async (memberId: string, email: string) => {
    if (!confirm(`Hapus akun member "${email}" beserta seluruh catatannya?`)) return;

    try {
      const res = await fetch(`/api/admin/members?memberId=${memberId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Akun member dihapus.", "info");
        fetchData();
      }
    } catch {
      showToast("Gagal menghapus member", "error");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productData.id || !productData.title || !productData.passkey) {
      showToast("ID Produk, Judul, dan Password Admin wajib diisi!", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passkey: productData.passkey,
          product: productData,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, "success");
        setIsProductModalOpen(false);
        fetchData();
      } else {
        showToast(data.error || "Gagal menyimpan produk", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Hapus produk digital "${title}"? Member yang memiliki produk ini tidak akan bisa membukanya lagi.`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Produk digital berhasil dihapus.", "info");
        fetchData();
      }
    } catch {
      showToast("Gagal menghapus produk", "error");
    }
  };

  const handleCopyLynkLink = (productId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://clyra-nine.vercel.app";
    const link = `${origin}/member/activate?product=${productId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(productId);
    showToast("Link Aktivasi Lynk.id berhasil disalin!", "success");
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#0c0e17] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Kelola Member &amp; Produk Digital (Lynk.id)</h2>
              <p className="text-xs text-slate-400">
                Total {members.length} Member Terdaftar • {products.length} Produk Digital Aktif di Supabase
              </p>
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSubTab("members")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  subTab === "members" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Member &amp; Akses ({members.length})</span>
              </button>
              <button
                onClick={() => setSubTab("products")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  subTab === "products" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Katalog Produk ({products.length})</span>
              </button>
            </div>

            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: MEMBERS & ACCESS */}
      {subTab === "members" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari email member atau nama..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
              />
            </div>

            <button
              onClick={() => {
                setGrantData({ email: "", productId: products[0]?.id || "", passkey: "" });
                setIsGrantModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Beri Akses Produk Manual</span>
            </button>
          </div>

          {/* Members Table */}
          <div className="bg-[#0c0e18] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Produk yang Dimiliki</th>
                    <th className="px-4 py-3">Terdaftar Sejak</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {members
                    .filter((m) => m.email.toLowerCase().includes(search.toLowerCase()))
                    .map((m) => {
                      const memberAccess = accessList.filter((a) => a.member_email === m.email);

                      return (
                        <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white">{m.full_name}</div>
                            <div className="text-slate-400 font-mono text-[11px]">{m.email}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            {memberAccess.length === 0 ? (
                              <span className="text-slate-500 font-mono text-[11px]">Belum ada produk</span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {memberAccess.map((a) => (
                                  <div
                                    key={a.id}
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-[10px] font-mono group"
                                  >
                                    <span>{a.clyra_products?.title || a.product_id}</span>
                                    <button
                                      onClick={() => handleRevokeAccess(a.id, m.email)}
                                      className="text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                                      title="Cabut Akses"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px]">
                            {new Date(m.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-mono">
                              {m.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => handleDeleteMember(m.id, m.email)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="Hapus Akun Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DIGITAL PRODUCTS CATALOG */}
      {subTab === "products" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setProductData({
                  id: `prod-${Date.now().toString().slice(-4)}`,
                  title: "",
                  tagline: "",
                  description: "",
                  category: "Ebook",
                  cover_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
                  version: "v1.0.0",
                  badge: "PRODUK DIGITAL",
                  download_url: "",
                  content_body: "# Bab 1\n\nTulis isi materi di sini...",
                  passkey: "",
                });
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Produk Digital Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-[#0c0e18] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-[10px] font-mono">
                        {p.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.version || "v1.0.0"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setProductData({ ...p, passkey: "" });
                          setIsProductModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        title="Edit Produk"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.title)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 cursor-pointer"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{p.description}</p>
                  </div>

                  {/* ID Slug */}
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>ID: <code className="text-indigo-400">{p.id}</code></span>
                    <button
                      onClick={() => handleCopyLynkLink(p.id)}
                      className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer font-bold"
                    >
                      {copiedLink === p.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink === p.id ? "Tersalin!" : "Salin Link Lynk.id"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: GRANT ACCESS MANUAL */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setIsGrantModalOpen(false)} />

          <div className="relative w-full max-w-md bg-[#0c0e18] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Beri Akses Produk Manual</h3>
              <button onClick={() => setIsGrantModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGrantAccess} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email Pembeli *</label>
                <input
                  type="email"
                  required
                  value={grantData.email}
                  onChange={(e) => setGrantData({ ...grantData, email: e.target.value })}
                  placeholder="pembeli@gmail.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Pilih Produk Digital *</label>
                <select
                  value={grantData.productId}
                  onChange={(e) => setGrantData({ ...grantData, productId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} ({p.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Master Password Admin *</label>
                <input
                  type="password"
                  required
                  value={grantData.passkey}
                  onChange={(e) => setGrantData({ ...grantData, passkey: e.target.value })}
                  placeholder="Password Admin Anda..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGrantModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Beri Akses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setIsProductModalOpen(false)} />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0c0e18] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {productData.id ? "Kelola Produk Digital" : "Tambah Produk Digital Baru"}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ID Slug Produk *</label>
                  <input
                    type="text"
                    required
                    value={productData.id || ""}
                    onChange={(e) => setProductData({ ...productData, id: e.target.value })}
                    placeholder="e.g. ebook-ai-prompts-mastery"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Kategori Produk</label>
                  <select
                    value={productData.category || "Ebook"}
                    onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Ebook">Ebook</option>
                    <option value="Script">Script</option>
                    <option value="Prompt Pack">Prompt Pack</option>
                    <option value="Tool">Tool</option>
                    <option value="Course">Course</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Judul Produk *</label>
                <input
                  type="text"
                  required
                  value={productData.title || ""}
                  onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                  placeholder="e.g. Masterclass AI Prompt Engineering"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={productData.description || ""}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                  placeholder="Jelaskan ringkasan materi atau kegunaan script..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Isi Materi / Source Code Lengkap (Markdown / Code) *
                </label>
                <textarea
                  rows={7}
                  required
                  value={productData.content_body || ""}
                  onChange={(e) => setProductData({ ...productData, content_body: e.target.value })}
                  placeholder="Tulis bab materi ebook atau kode script lengkap di sini..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono text-[11px] outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Download URL Asli (.PDF / .ZIP)</label>
                  <input
                    type="url"
                    value={productData.download_url || ""}
                    onChange={(e) => setProductData({ ...productData, download_url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Master Password Admin *</label>
                  <input
                    type="password"
                    required
                    value={productData.passkey || ""}
                    onChange={(e) => setProductData({ ...productData, passkey: e.target.value })}
                    placeholder="Password Admin..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Simpan Produk Digital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

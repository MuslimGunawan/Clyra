"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Sparkles, 
  FolderGit2, 
  Database, 
  LogOut, 
  ArrowLeft, 
  ShieldCheck,
  Send,
  GitBranch,
  Users,
  Eye,
  ExternalLink
} from "lucide-react";
import { isAdminAuthenticated, logoutAdmin } from "@/lib/adminAuth";
import { generateMemberSessionToken, ADMIN_MASTER_EMAIL } from "@/lib/memberAuth";
import PromptManager from "@/components/admin/PromptManager";
import ProjectManager from "@/components/admin/ProjectManager";
import MemberProductManager from "@/components/admin/MemberProductManager";
import DataBackupRestore from "@/components/admin/DataBackupRestore";
import AdminLoginModal from "@/components/admin/AdminLoginModal";
import GitHubPublishModal from "@/components/admin/GitHubPublishModal";
import DynamicLink from "@/components/DynamicLink";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompts" | "projects" | "members" | "backup">("prompts");

  useEffect(() => {
    const authStatus = isAdminAuthenticated();
    setIsAuthenticated(authStatus);
    setIsCheckingAuth(false);
    if (!authStatus) {
      setShowLoginModal(true);
    }
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    router.push("/");
  };

  const handlePreviewMemberWorkspace = () => {
    const token = generateMemberSessionToken(ADMIN_MASTER_EMAIL, "admin");
    localStorage.setItem("clyra_member_token", token);
    localStorage.setItem("clyra_member_email", ADMIN_MASTER_EMAIL);
    localStorage.setItem("clyra_member_name", "Master Administrator");
    router.push("/member/workspace");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-500 font-mono text-xs">
        Memverifikasi kredensial admin...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col justify-between relative overflow-hidden font-sans">
        <header className="relative z-10 max-w-6xl w-full mx-auto px-4 py-6">
          <DynamicLink
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-indigo-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </DynamicLink>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white">Akses Admin Dibatasi</h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Halaman ini membutuhkan otorisasi Master Admin Key untuk mengelola database Clyra.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Masuk ke Admin Vault
            </button>
          </div>
        </div>

        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={() => {
            if (!isAdminAuthenticated()) {
              router.push("/");
            } else {
              setShowLoginModal(false);
            }
          }}
          onSuccess={() => {
            setIsAuthenticated(true);
            setShowLoginModal(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-transparent blur-[140px] pointer-events-none" />

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Top Bar Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DynamicLink
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-indigo-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </DynamicLink>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Direct Member Workspace Preview Button */}
            <button
              onClick={handlePreviewMemberWorkspace}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Buka Member Workspace dengan Semua Produk Terbuka (Master Admin Access)"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>👑 Preview Member (Unlocked)</span>
            </button>

            {/* Quick Publish Button */}
            <button
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-500/40 text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
              title="Push semua perubahan ke GitHub & Deploy Live"
            >
              <Send className="w-3.5 h-3.5" />
              <span>🚀 Publish ke GitHub</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Authorized</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/50 text-slate-400 hover:text-red-300 text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar Sesi</span>
            </button>
          </div>
        </div>

        {/* Header Title */}
        <div className="bg-[#0c0e17] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ADMIN VAULT
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                  Pusat Pengelolaan Konten Clyra
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Kelola dan perbarui seluruh data koleksi AI Prompts, Portofolio Web, dan Member Produk Digital.
                </p>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start lg:self-auto overflow-x-auto w-full lg:w-auto">
              <button
                onClick={() => setActiveTab("prompts")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer",
                  activeTab === "prompts"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Prompts</span>
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer",
                  activeTab === "projects"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Web Works</span>
              </button>

              <button
                onClick={() => setActiveTab("members")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer",
                  activeTab === "members"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Members &amp; Produk</span>
              </button>

              <button
                onClick={() => setActiveTab("backup")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer",
                  activeTab === "backup"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Backup &amp; Sync GitHub</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content Container */}
        <div>
          {activeTab === "prompts" && <PromptManager />}
          {activeTab === "projects" && <ProjectManager />}
          {activeTab === "members" && <MemberProductManager />}
          {activeTab === "backup" && <DataBackupRestore />}
        </div>
      </main>

      {/* GitHub Auto-Deploy Modal */}
      <GitHubPublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
      />
    </div>
  );
}

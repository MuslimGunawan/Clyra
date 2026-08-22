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
  ShieldCheck 
} from "lucide-react";
import { isAdminAuthenticated, logoutAdmin } from "@/lib/adminAuth";
import PromptManager from "@/components/admin/PromptManager";
import ProjectManager from "@/components/admin/ProjectManager";
import DataBackupRestore from "@/components/admin/DataBackupRestore";
import AdminLoginModal from "@/components/admin/AdminLoginModal";
import DynamicLink from "@/components/DynamicLink";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompts" | "projects" | "backup">("prompts");

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

  if (isCheckingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0c0e17] border border-slate-800 rounded-2xl p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Sesi Terkunci</h2>
            <p className="text-xs text-slate-400">
              Otorisasi Master Key diperlukan untuk mengakses Admin Vault.
            </p>
          </div>
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            Buka Form Login Admin
          </button>
        </div>

        <AdminLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setIsAuthenticated(true);
            setShowLoginModal(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col">
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between">
          <DynamicLink
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-indigo-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </DynamicLink>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Authorized</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/50 text-slate-400 hover:text-red-300 text-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>

        {/* Header Title */}
        <div className="bg-[#0c0e17] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  Kelola dan perbarui seluruh data koleksi AI Prompts dan Portofolio Web Works secara instan.
                </p>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("prompts")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all",
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
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all",
                  activeTab === "projects"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Web Works</span>
              </button>

              <button
                onClick={() => setActiveTab("backup")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all",
                  activeTab === "backup"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Backup JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content Container */}
        <div>
          {activeTab === "prompts" && <PromptManager />}
          {activeTab === "projects" && <ProjectManager />}
          {activeTab === "backup" && <DataBackupRestore />}
        </div>
      </main>
    </div>
  );
}

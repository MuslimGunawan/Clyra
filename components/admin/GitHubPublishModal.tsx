"use client";

import React, { useState } from "react";
import { 
  Send, 
  RefreshCw, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  GitBranch,
  Layers,
  Sparkles
} from "lucide-react";
import { getStoredPrompts, getStoredProjects } from "@/lib/adminStore";
import { useToast } from "@/components/ToastProvider";

interface GitHubPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GitHubPublishModal({ isOpen, onClose }: GitHubPublishModalProps) {
  const { showToast } = useToast();
  const [passkey, setPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  if (!isOpen) return null;

  const prompts = getStoredPrompts();
  const projects = getStoredProjects();

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    setPublishStatus(null);

    if (!passkey.trim()) {
      setPublishError("Silakan masukkan Master Password Admin untuk otorisasi push.");
      return;
    }

    setIsPublishing(true);
    setPublishStatus("Menyiapkan data dan menghubungkan ke GitHub REST API...");

    try {
      const res = await fetch("/api/admin/github-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passkey: passkey.trim(),
          prompts,
          projects,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPublishStatus(data.message);
        showToast("Sukses! Data telah di-commit & di-push ke GitHub Repo.", "success");
        setPasskey("");
      } else {
        setPublishError(data.error || "Gagal sinkronisasi ke GitHub.");
        showToast(data.error || "Gagal publikasi ke GitHub", "error");
      }
    } catch (err: any) {
      setPublishError(err.message || "Terjadi kesalahan jaringan.");
      showToast("Gagal terhubung ke endpoint API", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleModalClose = () => {
    setPublishStatus(null);
    setPublishError(null);
    setPasskey("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={handleModalClose}
    >
      <div
        className="w-full max-w-lg bg-[#0e111a] border border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-indigo-950/50 space-y-5 animate-scaleUp relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <Send className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  GitHub Auto-Deploy Pipeline
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <GitBranch className="w-3 h-3" />
                  main
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mt-1">
                Publikasikan Perubahan ke GitHub (Live Vercel)
              </h3>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5">
          <div className="text-xs text-slate-300">
            Perubahan yang akan di-commit &amp; di-push ke repositori GitHub:
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Total AI Prompts</span>
                <span className="text-sm font-bold text-white font-mono">{prompts.length} Prompt</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Total Web Works</span>
                <span className="text-sm font-bold text-white font-mono">{projects.length} Projek</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            Setelah push berhasil, <strong>Vercel akan otomatis mendeteksi pembaruan dan mendeploy live</strong> dalam ~30 detik tanpa perlu redeploy manual lagi.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handlePublish} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Masukkan Master Password Admin</span>
              <span className="text-[10px] text-indigo-400 font-mono">Otorisasi Push</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPasskey ? "text" : "password"}
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Master Key Admin..."
                autoFocus
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                title={showPasskey ? "Sembunyikan" : "Tampilkan"}
              >
                {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback Status */}
          {publishStatus && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{publishStatus}</span>
            </div>
          )}

          {publishError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{publishError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={isPublishing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 hover:from-indigo-500 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Meng-commit ke GitHub...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>🚀 Publish &amp; Push ke GitHub</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

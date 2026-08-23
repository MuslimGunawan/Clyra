"use client";

import { useState } from "react";
import { 
  Download, 
  Upload, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  FileText, 
  Send, 
  GitBranch, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Layers
} from "lucide-react";
import { 
  exportVaultBackup, 
  importVaultBackup, 
  getStoredPrompts, 
  getStoredProjects 
} from "@/lib/adminStore";
import { useToast } from "@/components/ToastProvider";

export default function DataBackupRestore() {
  const { showToast } = useToast();
  const [importJson, setImportJson] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // GitHub Auto-Publish State
  const [isPublishing, setIsPublishing] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const handleExport = () => {
    const json = exportVaultBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clyra_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup JSON berhasil diunduh!", "success");
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;

    const result = importVaultBackup(importJson);
    if (result.success) {
      showToast(result.message, "success");
      setImportJson("");
      setIsImporting(false);
    } else {
      showToast(result.message, "error");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJson(content);
        setIsImporting(true);
      }
    };
    reader.readAsText(file);
  };

  const handlePublishToGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);
    setPublishStatus(null);

    if (!passkey.trim()) {
      setPublishError("Silakan masukkan Master Key Admin untuk otorisasi push.");
      return;
    }

    setIsPublishing(true);
    setPublishStatus("Menyiapkan data dan menghubungkan ke GitHub REST API...");

    try {
      const prompts = getStoredPrompts();
      const projects = getStoredProjects();

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

  return (
    <div className="space-y-6">
      {/* 1. GITHUB AUTO-COMMIT & LIVE DEPLOY PUBLISHER */}
      <div className="bg-gradient-to-br from-[#0c0e17] via-[#101424] to-[#0c0e17] border border-indigo-500/30 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Send className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  GitHub REST API • Vercel Sync
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <GitBranch className="w-3 h-3" />
                  main
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                Publikasikan Perubahan ke GitHub (Live Deploy)
              </h3>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Tombol ini akan otomatis meng-<strong>commit dan push</strong> seluruh data prompt dan projek web Anda langsung ke repositori GitHub (<code className="text-indigo-300 font-mono">MuslimGunawan/Clyra</code>). Vercel akan otomatis mendeteksi commit baru dan mendeploy pembaruan secara <em>live</em> dalam ~30 detik!
        </p>

        {/* Form Publish */}
        <form onSubmit={handlePublishToGitHub} className="pt-2 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPasskey ? "text" : "password"}
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Masukkan Master Password Admin untuk Otorisasi..."
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 hover:from-indigo-500 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Meng-commit...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>🚀 Publish &amp; Push ke GitHub</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback Status */}
          {publishStatus && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{publishStatus}</span>
            </div>
          )}

          {publishError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{publishError}</span>
            </div>
          )}
        </form>
      </div>

      {/* 2. LOCAL JSON BACKUP & RESTORE */}
      <div className="bg-[#0c0e17] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Cadangan File Offline (*Local File Backup*)</h3>
            <p className="text-xs text-slate-400">
              Unduh dan simpan cadangan manual format file <code className="text-slate-300 font-mono">.json</code> ke komputer atau HP Anda.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export Action */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export File Cadangan</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Unduh file `.json` berisi seluruh koleksi prompt dan projek web Anda.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File Backup (.json)</span>
            </button>
          </div>

          {/* Import Action */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Restore dari File</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Pulihkan data dari file `.json` cadangan yang pernah Anda unduh sebelumnya.
              </p>
            </div>
            <label className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95 cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Pilih File Backup JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Manual JSON Paste / Review Modal */}
      {isImporting && (
        <div className="bg-[#0a0c13] border border-slate-800 rounded-2xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Review Data JSON yang Akan Di-restore</span>
            </h4>
            <button
              onClick={() => setIsImporting(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Batal
            </button>
          </div>

          <form onSubmit={handleImport} className="space-y-3">
            <textarea
              rows={6}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono text-xs focus:border-indigo-500 outline-none"
              placeholder="Paste isi JSON di sini..."
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImporting(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Terapkan Pemulihan Data</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Download, Upload, ShieldCheck, Database, RefreshCw, FileText } from "lucide-react";
import { exportVaultBackup, importVaultBackup } from "@/lib/adminStore";
import { useToast } from "@/components/ToastProvider";

export default function DataBackupRestore() {
  const { showToast } = useToast();
  const [importJson, setImportJson] = useState("");
  const [isImporting, setIsImporting] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-[#0c0e17] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Pencadangan &amp; Pemulihan Data (*Vault Backup*)</h3>
            <p className="text-xs text-slate-400">
              Simpan dan pulihkan seluruh data AI Prompts &amp; Web Works kapan saja dalam format JSON.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export Action */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export Data Vault</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Unduh file `.json` berisi seluruh koleksi prompt dan projek web Anda.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
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
                <span>Import / Restore Data</span>
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

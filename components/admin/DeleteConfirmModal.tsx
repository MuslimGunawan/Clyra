"use client";

import React from "react";
import { Trash2, AlertTriangle, X, ShieldAlert } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemTitle?: string;
  itemType?: "Prompt" | "Projek Web" | "Item";
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemTitle,
  itemType = "Prompt",
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0e101a] border border-red-900/60 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-red-950/40 space-y-5 animate-scaleUp relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/10">
              <Trash2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60">
                Konfirmasi Hapus {itemType}
              </span>
              <h3 className="text-base font-bold text-white tracking-tight mt-1">
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Batal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Info Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <span className="text-[11px] text-slate-400 block font-mono">
            Item yang akan dihapus dari vault:
          </span>
          <div className="text-xs font-bold text-white bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 break-words">
            {itemTitle || "Item terpilih"}
          </div>
          <p className="text-[11px] text-red-300/80 flex items-center gap-1.5 pt-1">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-red-400" />
            <span>Data ini akan dihapus secara permanen dari penyimpanan.</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Permanen</span>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { AlertTriangle, Lock, Eye, EyeOff, ShieldAlert, X } from "lucide-react";
import { verifyAdminPasswordOnly } from "@/lib/adminAuth";
import { useToast } from "@/components/ToastProvider";

interface DestructiveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmButtonText?: string;
}

export default function DestructiveConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText = "Konfirmasi & Reset Data",
}: DestructiveConfirmModalProps) {
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Silakan masukkan Master Password Admin untuk konfirmasi.");
      return;
    }

    const isValid = verifyAdminPasswordOnly(password);
    if (!isValid) {
      setError("Password salah! Verifikasi keamanan ditolak.");
      return;
    }

    // Password matches -> proceed
    setPassword("");
    setError("");
    onConfirm();
    onClose();
  };

  const handleModalClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={handleModalClose}
    >
      <div
        className="w-full max-w-md bg-[#0e101a] border border-red-900/60 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-red-950/40 space-y-5 animate-scaleUp relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/10">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/60">
                Tindakan Kritis Destruktif
              </span>
              <h3 className="text-base font-bold text-white tracking-tight mt-1">
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Batal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-1.5">
          <p className="text-xs text-red-200/90 leading-relaxed font-sans">
            {description}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-red-400 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Tindakan ini tidak dapat dibatalkan setelah dikonfirmasi.</span>
          </div>
        </div>

        {/* Security Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Masukkan Master Password Admin</span>
              <span className="text-[10px] text-slate-500 font-mono">Autentikasi Ulang</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Master Key Admin..."
                autoFocus
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-red-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? "Sembunyikan" : "Tampilkan"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-400 font-mono pt-1 flex items-center gap-1">
                <span>⚠</span>
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{confirmButtonText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

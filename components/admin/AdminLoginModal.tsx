"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, KeyRound, ArrowRight, X, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { authenticateAdmin, getAdminLockoutStatus } from "@/lib/adminAuth";
import { createEphemeralToken } from "@/lib/cryptoTokens";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const router = useRouter();
  const [passkey, setPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutStatus, setLockoutStatus] = useState({ locked: false, remainingSeconds: 0 });

  useEffect(() => {
    if (isOpen) {
      setPasskey("");
      setErrorMsg("");
      setLockoutStatus(getAdminLockoutStatus());
    }
  }, [isOpen]);

  // Lockout countdown timer effect
  useEffect(() => {
    if (!lockoutStatus.locked) return;
    const timer = setInterval(() => {
      const current = getAdminLockoutStatus();
      setLockoutStatus(current);
      if (!current.locked) {
        setErrorMsg("");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutStatus.locked]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg("");

    setTimeout(() => {
      const result = authenticateAdmin(passkey);
      setIsSubmitting(false);

      if (result.success) {
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          // Navigate via verified dynamic ephemeral token
          const adminToken = createEphemeralToken("/admin");
          router.push(`/v/${adminToken}`);
        }
      } else {
        setErrorMsg(result.error || "Akses ditolak.");
        setLockoutStatus(getAdminLockoutStatus());
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-[#0a0c13] border border-slate-800/90 rounded-2xl p-6 shadow-2xl space-y-5 z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Admin Vault Gateway</h3>
            <p className="text-[11px] text-slate-400 font-mono">Master Key Authentication</p>
          </div>
        </div>

        {/* Lockout Warning */}
        {lockoutStatus.locked ? (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Sistem Terkunci Sementara</span>
            </div>
            <p className="text-[11px] text-red-400 leading-relaxed">
              Terlalu banyak percobaan gagal. Silakan tunggu <strong className="font-mono text-white">{lockoutStatus.remainingSeconds}s</strong> sebelum mencoba kembali.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                <span>Kunci Akses Admin (Master Key)</span>
                <span className="text-[10px] text-slate-500 font-mono">Role: Owner</span>
              </label>

              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPasskey ? "text" : "password"}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Masukkan Master Key..."
                  autoFocus
                  disabled={lockoutStatus.locked}
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                >
                  {showPasskey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-red-400 font-medium animate-shake">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={!passkey.trim() || isSubmitting || lockoutStatus.locked}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <span>Buka Admin Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

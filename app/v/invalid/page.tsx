import Link from "next/link";
import { ShieldAlert, ArrowLeft, RefreshCw, Lock } from "lucide-react";

export default function InvalidTokenPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0d0f17] border border-red-900/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fadeIn relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
          <ShieldAlert className="w-7 h-7 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-300 text-[10px] font-mono border border-red-500/20">
            <Lock className="w-3 h-3" />
            <span>SECURITY GUARD SHIELD</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Token Navigasi Tidak Sah / Kedaluwarsa
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sistem mendeteksi token URL telah diubah, dimanipulasi, atau telah kedaluwarsa. Clyra memverifikasi keaslian kriptografis setiap tautan untuk mencegah eksploitasi rute.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda Aman</span>
          </Link>
          <Link
            href="/tools"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Buka Direktori Tools</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

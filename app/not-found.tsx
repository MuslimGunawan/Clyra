"use client";

import DynamicLink from "@/components/DynamicLink";
import { Compass, Wrench, ShieldAlert, ArrowLeft, Terminal } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-[#0e111a] border border-slate-800/90 rounded-3xl p-8 sm:p-10 text-center shadow-2xl space-y-6 relative overflow-hidden animate-fadeIn">
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Badge */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            404
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Rute atau token URL yang Anda tuju tidak valid, telah kedaluwarsa, atau tidak terdaftar dalam protokol Clyra Hub.
          </p>
        </div>

        {/* Quick Navigation Buttons */}
        <div className="space-y-3 pt-2">
          <DynamicLink
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </DynamicLink>

          <DynamicLink
            href="/tools"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-indigo-400" />
            <span>Jelajahi Suite Tools</span>
          </DynamicLink>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-500">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Clyra Security Gateway • 404 Protocol</span>
        </div>
      </div>
    </div>
  );
}

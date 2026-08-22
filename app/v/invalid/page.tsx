import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function InvalidTokenPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0d0f17] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fadeIn relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto shadow-lg">
          <Compass className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tautan yang Anda tuju tidak valid, sudah berpindah, atau sesi halaman telah berakhir.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link
            href="/tools"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-all"
          >
            <span>Buka Direktori Tools</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

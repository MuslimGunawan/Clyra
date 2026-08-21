"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Scale, ShieldCheck, Check, ShieldAlert, Lock } from "lucide-react";

export default function TermsGatekeeper() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem("clyra_terms_accepted_v2");
      if (!accepted) {
        setIsOpen(true);
        // Prevent background scrolling while modal is open
        document.body.style.overflow = "hidden";
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("clyra_terms_accepted_v2", "true");
    } catch (e) {}
    document.body.style.overflow = "unset";
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#05060a]/90 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0e111a] border border-indigo-500/50 rounded-3xl shadow-[0_0_60px_-15px_rgba(99,102,241,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Glowing Header */}
        <div className="p-6 sm:p-7 bg-gradient-to-b from-indigo-950/40 to-transparent border-b border-slate-800 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/10">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
              Persetujuan Wajib Pengguna
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Syarat, Ketentuan &amp; Disclaimer Legal
            </h2>
          </div>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed border-b border-slate-800">
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-amber-300">Penting:</strong> Anda wajib membaca dan menyetujui ketentuan ini sebelum menggunakan tools atau layanan apa pun di platform Clyra.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase font-mono text-indigo-300">
              1. Pelepasan Tanggung Jawab Hukum (Disclaimer of Liability)
            </h4>
            <p>
              Platform <strong>Clyra</strong> disediakan semata-mata sebagai alat bantu produktivitas pribadi dan edukasi. Pemilik/pengembang website Clyra <strong>TIDAK BERTANGGUNG JAWAB</strong> atas segala tuntutan hukum, kerugian, pelanggaran hak cipta, atau penyalahgunaan apa pun yang dilakukan oleh pengguna.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase font-mono text-indigo-300">
              2. Tanggung Jawab Mandiri Pengguna
            </h4>
            <p>
              Pengguna menyatakan bahwa setiap file, teks, media, atau konten yang diunduh, dikonversi, atau diproses melalui tools ini adalah untuk kepentingan pribadi yang sah. Segala risiko hukum dan kepatuhan hak cipta <strong>sepenuhnya menjadi tanggung jawab pengguna sendiri</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase font-mono text-indigo-300">
              3. Privasi Sisi Klien (Zero Server Storage)
            </h4>
            <p>
              Semua proses konversi dan enkripsi berlangsung 100% di browser Anda tanpa pernah diunggah atau disimpan di server Clyra.
            </p>
          </div>

          <div className="text-[11px] text-slate-400 pt-1">
            Baca naskah hukum lengkap di{" "}
            <Link href="/terms" target="_blank" className="text-indigo-400 underline hover:text-indigo-300">
              Halaman Syarat &amp; Disclaimer Resmi
            </Link>
            .
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-[#08090d] flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500 accent-indigo-500"
            />
            <span>Saya telah membaca dan menyetujui seluruh ketentuan</span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!isChecked}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Setuju &amp; Masuk ke Web</span>
          </button>
        </div>
      </div>
    </div>
  );
}

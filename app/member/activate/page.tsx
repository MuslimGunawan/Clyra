"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Lock, 
  Mail, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Layers, 
  AlertCircle,
  UserCheck
} from "lucide-react";
import DynamicLink from "@/components/DynamicLink";
import { useToast } from "@/components/ToastProvider";

function ActivateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const queryEmail = searchParams.get("email") || "";
  const queryProduct = searchParams.get("product") || searchParams.get("productId") || "";
  const queryOrder = searchParams.get("order") || searchParams.get("orderId") || "";

  const [email, setEmail] = useState(queryEmail);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [queryEmail]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter demi keamanan akun Anda.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok. Silakan periksa kembali.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/member/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: fullName.trim() || "Member Clyra",
          productId: queryProduct,
          orderId: queryOrder,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("clyra_member_token", data.token);
        localStorage.setItem("clyra_member_email", data.member.email);
        localStorage.setItem("clyra_member_name", data.member.fullName);
        showToast("Selamat! Akun Anda aktif. Membuka workspace...", "success");
        router.push("/member/workspace");
      } else {
        setError(data.error || "Gagal mengaktifkan akun.");
        showToast(data.error || "Aktivasi gagal", "error");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan jaringan.");
      showToast("Gagal terhubung ke server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-4 py-6 flex items-center justify-between">
        <DynamicLink href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-black text-sm">
            C
          </div>
          <span className="text-base font-extrabold text-white tracking-wider">
            CLYRA <span className="text-indigo-400 font-mono text-xs">MEMBER VAULT</span>
          </span>
        </DynamicLink>

        <DynamicLink
          href="/member/login"
          className="text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          Sudah Punya Password? Login
        </DynamicLink>
      </header>

      {/* Main Activation Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-[#0c0e18] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 space-y-6 relative overflow-hidden">
          {/* Top Badge */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Aktivasi Akun Lynk.id
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Multi-Device Access</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Aktivasi Workspace Anda
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Buat password pribadi Anda untuk membuka seluruh produk digital yang telah Anda beli.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleActivate} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Email Pembelian (Lynk.id)</span>
                {queryEmail && (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Terverifikasi Pembeli
                  </span>
                )}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={Boolean(queryEmail)}
                  placeholder="nama@emailanda.com"
                  className={`w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors ${
                    queryEmail ? "text-slate-300 font-mono bg-slate-950/60 cursor-not-allowed" : "focus:border-indigo-500"
                  }`}
                />
              </div>
            </div>

            {/* Full Name (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Nama Lengkap / Panggilan (Opsional)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Buat Password Baru</span>
                <span className="text-[10px] text-slate-500 font-mono">Min. 6 Karakter</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ketik password pilihan Anda..."
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Konfirmasi Ulang Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password di atas..."
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 hover:from-indigo-500 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Sedang Mengaktifkan Akun...</span>
              ) : (
                <>
                  <span>🚀 Buat Akun &amp; Buka Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Note */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Terenkripsi Cloud Database • Akses Multi-Device</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-4 py-6 text-center text-xs text-slate-600 font-mono">
        © {new Date().getFullYear()} Clyra Platform. All rights reserved.
      </footer>
    </div>
  );
}

export default function MemberActivatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400 font-mono text-xs">Memuat aktivasi...</div>}>
      <ActivateContent />
    </Suspense>
  );
}

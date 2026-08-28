"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  KeyRound
} from "lucide-react";
import DynamicLink from "@/components/DynamicLink";
import { useToast } from "@/components/ToastProvider";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function MemberLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("clyra_member_token", data.token);
        localStorage.setItem("clyra_member_email", data.member.email);
        localStorage.setItem("clyra_member_name", data.member.fullName);
        showToast(
          data.isAdmin
            ? "👑 Mode Master Admin Aktif! Semua produk terbuka."
            : "Login berhasil! Membuka workspace...",
          "success"
        );
        router.push("/member/workspace");
      } else {
        setError(data.error || "Email atau password tidak sesuai.");
        showToast(data.error || "Login gagal", "error");
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
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-4 py-6 flex items-center justify-between">
        <DynamicLink href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-black text-sm">
            C
          </div>
          <span className="text-base font-extrabold text-white tracking-wider">
            CLYRA <span className="text-indigo-400 font-mono text-xs">{t("member.vault_badge")}</span>
          </span>
        </DynamicLink>

        <DynamicLink
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          {t("terms.back_home")}
        </DynamicLink>
      </header>

      {/* Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-[#0c0e18] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {t("member.login_title")}
              </h1>
              <p className="text-xs text-slate-400">
                {t("member.login_desc")}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                {t("member.email_label")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@emailanda.com"
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                {t("member.password_label")}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>{t("member.login_btn")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Activation Link */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2 text-center">
            <p className="text-xs text-slate-400">
              Belum membuat password akun pembeli?
            </p>
            <DynamicLink
              href="/member/activate"
              className="inline-block text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
            >
              {t("member.activate_title")} →
            </DynamicLink>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-4 py-6 text-center text-xs text-slate-600 font-mono">
        © {new Date().getFullYear()} Clyra. All rights reserved.
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, Check, X, Scale } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DisclaimerBanner() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem("clyra_terms_accepted");
      if (!accepted) {
        setIsVisible(true);
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("clyra_terms_accepted", "true");
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slideUp">
      <div className="bg-[#0e111a]/95 border border-indigo-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t("footer.terms")}</h4>
              <p className="text-[10px] text-slate-400 font-mono">100% Client-Side Privacy</p>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {t("terms.client_side_desc")}
        </p>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <Link
            href="/terms"
            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
          >
            {t("footer.terms")} →
          </Link>

          <button
            onClick={handleAccept}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t("terms.accept_btn")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import DynamicLink from "@/components/DynamicLink";
import { Scale, Terminal, History } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-slate-800/60 bg-[#06070a]/90 text-slate-400 text-xs py-10 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 tracking-tight">Clyra</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{t("footer.title")}</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            {t("footer.desc")}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
          <DynamicLink href="/tools" className="hover:text-indigo-400 transition-colors">
            {t("nav.tools")}
          </DynamicLink>
          <DynamicLink href="/projects/prompts" className="hover:text-indigo-400 transition-colors">
            {t("nav.prompts")}
          </DynamicLink>
          <DynamicLink href="/projects/web" className="hover:text-indigo-400 transition-colors">
            {t("nav.web")}
          </DynamicLink>
          <button
            onClick={() => window.dispatchEvent(new Event("clyra_open_changelog"))}
            className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Changelog (v2.0.0)</span>
          </button>
          <DynamicLink href="/terms" className="text-slate-500 hover:text-indigo-300 transition-colors flex items-center gap-1">
            <Scale className="w-3.5 h-3.5" />
            <span>{t("footer.terms")}</span>
          </DynamicLink>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t("footer.crafted")}</span>
        </div>
      </div>
    </footer>
  );
}

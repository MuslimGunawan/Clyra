"use client";

import { useState } from "react";
import { Copy, Check, Eye, Sparkles } from "lucide-react";
import { PromptItem } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface PromptCardProps {
  item?: PromptItem;
  prompt?: PromptItem;
  onClick?: () => void;
  onOpenModal?: (prompt: PromptItem) => void;
}

export default function PromptCard({ item, prompt, onClick, onOpenModal }: PromptCardProps) {
  const currentPrompt = item || prompt!;
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(currentPrompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCardClick = () => {
    if (onClick) onClick();
    else if (onOpenModal) onOpenModal(currentPrompt);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-[#0f111a]/80 hover:bg-[#131724] border border-slate-800/80 hover:border-indigo-500/40 rounded-xl overflow-hidden transition-all duration-300 shadow-lg cursor-pointer"
    >
      {/* Thumbnail with overlay */}
      <div className="relative w-full h-48 sm:h-52 bg-slate-900 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentPrompt.thumbnail}
          alt={currentPrompt.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-black/70 text-indigo-300 border border-slate-700/60 backdrop-blur-md">
            {currentPrompt.aiModel}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
            {currentPrompt.category}
          </span>
        </div>

        {/* Quick Hover Action Overlay */}
        <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-slate-200 text-xs font-medium border border-slate-700 shadow-lg">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t("prompts.click_detail")}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4 className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors text-sm line-clamp-1">
            {currentPrompt.title}
          </h4>
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {currentPrompt.description}
          </p>
        </div>

        {/* Tags & Action Button */}
        <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {currentPrompt.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
              >
                #{tag}
              </span>
            ))}
          </div>

          <button
            onClick={handleCopy}
            title={t("prompts.copy_prompt")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px]">{t("prompts.copied")}</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="text-[11px]">{t("prompts.copy_prompt")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

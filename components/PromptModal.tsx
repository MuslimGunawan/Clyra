"use client";

import { useState } from "react";
import { X, Copy, Check, Sparkles, Tag, Sliders, ExternalLink } from "lucide-react";
import { PromptItem } from "@/lib/types";

interface PromptModalProps {
  prompt: PromptItem | null;
  onClose: () => void;
}

export default function PromptModal({ prompt, onClose }: PromptModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedNeg, setCopiedNeg] = useState(false);

  if (!prompt) return null;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyNegative = async () => {
    if (!prompt.negativePrompt) return;
    try {
      await navigator.clipboard.writeText(prompt.negativePrompt);
      setCopiedNeg(true);
      setTimeout(() => setCopiedNeg(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0d0f17] border border-slate-800 rounded-2xl shadow-2xl z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Thumbnail preview banner */}
        <div className="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={prompt.thumbnail}
            alt={prompt.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f17] via-[#0d0f17]/40 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 backdrop-blur-md">
              {prompt.aiModel}
            </span>
            <span className="text-xs font-mono text-slate-300 bg-black/60 px-2.5 py-1 rounded-md border border-slate-700">
              {prompt.category}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {prompt.title}
            </h2>
            <p className="mt-1 text-sm text-slate-400 leading-relaxed">
              {prompt.description}
            </p>
          </div>

          {/* Main Prompt Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Prompt Command
              </span>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Prompt</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#08090d] border border-slate-800 text-slate-200 text-xs sm:text-sm font-mono leading-relaxed select-all whitespace-pre-wrap max-h-96 overflow-y-auto">
              {prompt.prompt}
            </div>
          </div>

          {/* Negative Prompt if exists */}
          {prompt.negativePrompt && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Negative Prompt (Opsi)
                </span>
                <button
                  onClick={handleCopyNegative}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  {copiedNeg ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 rounded-lg bg-[#08090d] border border-slate-800 text-slate-400 text-xs font-mono select-all">
                {prompt.negativePrompt}
              </div>
            </div>
          )}

          {/* Parameters & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            {prompt.parameters && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  Parameters
                </span>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-300">
                  {prompt.parameters.aspectRatio && (
                    <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      Aspect Ratio: {prompt.parameters.aspectRatio}
                    </span>
                  )}
                  {prompt.parameters.stylize && (
                    <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      Stylize: {prompt.parameters.stylize}
                    </span>
                  )}
                  {prompt.parameters.chaos && (
                    <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      Chaos: {prompt.parameters.chaos}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {prompt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

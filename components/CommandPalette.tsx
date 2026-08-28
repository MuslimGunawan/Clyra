"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Wrench, 
  Sparkles, 
  FolderGit2, 
  ArrowRight, 
  Command, 
  X,
  ExternalLink
} from "lucide-react";
import { TOOLS } from "@/data/tools";
import { PROMPTS } from "@/data/prompts";
import { PROJECTS } from "@/data/projects";
import { IconHelper } from "./IconHelper";
import { createEphemeralToken } from "@/lib/cryptoTokens";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Combined searchable items
  const results = useMemo(() => {
    if (!query.trim()) {
      // Default suggested tools and prompts
      return [
        ...TOOLS.slice(0, 4).map((t) => ({
          type: "tool" as const,
          id: t.id,
          title: t.name,
          subtitle: t.description,
          url: t.status === "ready" ? `/tools/${t.slug}` : "/tools",
          iconName: t.iconName,
          badge: t.badge || "Tool",
        })),
        ...PROMPTS.slice(0, 2).map((p) => ({
          type: "prompt" as const,
          id: p.id,
          title: p.title,
          subtitle: p.aiModel,
          url: "/projects/prompts",
          iconName: "Sparkles",
          badge: "Prompt",
        })),
      ];
    }

    const q = query.toLowerCase();

    const toolMatches = TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    ).map((t) => ({
      type: "tool" as const,
      id: t.id,
      title: t.name,
      subtitle: t.description,
      url: t.status === "ready" ? `/tools/${t.slug}` : "/tools",
      iconName: t.iconName,
      badge: t.badge || "Tool",
    }));

    const promptMatches = PROMPTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q))
    ).map((p) => ({
      type: "prompt" as const,
      id: p.id,
      title: p.title,
      subtitle: `${p.aiModel} • ${p.category}`,
      url: "/projects/prompts",
      iconName: "Sparkles",
      badge: "Prompt",
    }));

    const projectMatches = PROJECTS.filter(
      (proj) =>
        proj.title.toLowerCase().includes(q) ||
        proj.description.toLowerCase().includes(q) ||
        proj.techStack.some((tech) => tech.toLowerCase().includes(q))
    ).map((proj) => ({
      type: "project" as const,
      id: proj.id,
      title: proj.title,
      subtitle: proj.description,
      url: "/projects/web",
      iconName: "FolderGit2",
      badge: "Project",
    }));

    return [...toolMatches, ...promptMatches, ...projectMatches];
  }, [query]);

  const handleSelect = (item: (typeof results)[0]) => {
    const dynamicToken = createEphemeralToken(item.url);
    router.push(`/v/${dynamicToken}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#0d0f17] border border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden space-y-2">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-800 bg-[#08090d]">
          <Search className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t("palette.placeholder")}
            className="w-full bg-transparent py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {results.length > 0 ? (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-indigo-600/20 border border-indigo-500/40 text-white"
                      : "hover:bg-slate-900/60 border border-transparent text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-500"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      <IconHelper name={item.iconName} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {item.badge}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              {t("palette.no_results")}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#08090d] border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ {t("nav.search")}</span>
            <span>↵ Enter</span>
            <span>ESC Close</span>
          </div>
          <span>Clyra Spotlight</span>
        </div>
      </div>
    </div>
  );
}

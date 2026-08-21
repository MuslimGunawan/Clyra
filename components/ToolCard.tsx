"use client";

import { ArrowUpRight, Lock, Star, Flame } from "lucide-react";
import { ToolItem } from "@/lib/types";
import { IconHelper } from "./IconHelper";
import { cn } from "@/lib/utils";
import { recordToolUsage } from "@/lib/toolUsage";
import DynamicLink from "./DynamicLink";

interface ToolCardProps {
  tool: ToolItem;
  isPinned?: boolean;
  onTogglePin?: (slug: string) => void;
  usageScore?: number;
}

export default function ToolCard({
  tool,
  isPinned = false,
  onTogglePin,
  usageScore,
}: ToolCardProps) {
  const isReady = tool.status === "ready";

  const handleCardClick = () => {
    if (isReady) {
      recordToolUsage(tool.slug);
    }
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTogglePin) {
      onTogglePin(tool.slug);
    }
  };

  const targetUrl = isReady ? `/tools/${tool.slug}` : "#";

  if (!isReady) {
    return (
      <div className="group relative flex flex-col justify-between p-5 rounded-2xl transition-all duration-300 border bg-[#0c0d14]/50 border-slate-800/40 opacity-75 cursor-not-allowed">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800/50 text-slate-500 border border-slate-700/30">
              <IconHelper name={tool.iconName} className="w-5 h-5" />
            </div>
            {tool.badge && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold border bg-amber-500/10 text-amber-300 border-amber-500/30">
                {tool.badge}
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold tracking-tight text-slate-400 mb-1.5">{tool.name}</h3>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{tool.description}</p>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 italic">Tahap Pengembangan</span>
        </div>
      </div>
    );
  }

  return (
    <DynamicLink
      href={targetUrl}
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl transition-all duration-300 border bg-[#0f121d]/75 hover:bg-[#141828] border-slate-800/80 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer"
      )}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 border border-indigo-500/20"
            )}
          >
            <IconHelper name={tool.iconName} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {/* Usage Heat Badge */}
            {usageScore && usageScore > 100 && (
              <span className="flex items-center gap-0.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Trending</span>
              </span>
            )}

            {tool.badge && (
              <span
                className={cn(
                  "text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold border bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                )}
              >
                {tool.badge}
              </span>
            )}

            {/* Pin Star Button */}
            {onTogglePin && (
              <button
                type="button"
                onClick={handlePinClick}
                className={cn(
                  "p-1 rounded-lg transition-colors border",
                  isPinned
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-slate-900 text-slate-500 hover:text-amber-300 border-slate-800"
                )}
                title={isPinned ? "Lepas Pin Favorit" : "Pin ke Quick Access"}
              >
                <Star
                  className={cn(
                    "w-3.5 h-3.5",
                    isPinned && "fill-amber-400 text-amber-400"
                  )}
                />
              </button>
            )}
          </div>
        </div>

        <h3
          className={cn(
            "text-base font-semibold tracking-tight transition-colors mb-1.5 text-slate-100 group-hover:text-indigo-300"
          )}
        >
          {tool.name}
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Footer / Tags */}
      <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-xs">
        <div className="flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 text-indigo-400 text-xs font-medium group-hover:translate-x-0.5 transition-transform">
          <span>Buka</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </DynamicLink>
  );
}

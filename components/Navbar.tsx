"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Wrench, 
  Sparkles, 
  FolderGit2, 
  Compass, 
  Layers, 
  Search, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import CommandPalette from "./CommandPalette";
import DynamicLink from "./DynamicLink";

export default function Navbar() {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showBetaBar, setShowBetaBar] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: Compass },
    { href: "/tools", label: "Tools Hub", icon: Wrench, badge: "11" },
    { href: "/projects/prompts", label: "AI Prompts", icon: Sparkles },
    { href: "/projects/web", label: "Web Works", icon: FolderGit2 },
  ];

  return (
    <>
      {/* Early Access / Beta Notice Bar */}
      {showBetaBar && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-indigo-950/80 border-b border-indigo-500/30 px-4 py-1.5 text-[11px] text-indigo-200 flex items-center justify-between gap-3 font-mono">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-center sm:text-left justify-center flex-1">
            <span className="px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-500/40 text-[10px]">
              EARLY ACCESS
            </span>
            <span className="text-slate-300 truncate sm:overflow-visible">
              Clyra Platform aktif dioptimalkan — aman, terenkripsi, &amp; privat.
            </span>
          </div>
          <button
            onClick={() => setShowBetaBar(false)}
            className="text-indigo-400 hover:text-white transition-colors p-1"
            title="Tutup pengumuman"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#08090d]/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo with Dynamic Ephemeral routing */}
          <DynamicLink href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#090b10] rounded-[7px] flex items-center justify-center">
                <Layers className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white text-base group-hover:text-indigo-300 transition-colors">
                Clyra<span className="text-indigo-400">.</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono -mt-1 tracking-wider uppercase">
                Productivity Hub
              </span>
            </div>
          </DynamicLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-full border border-slate-800/70">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <DynamicLink
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded-full font-mono border border-indigo-500/30">
                      {link.badge}
                    </span>
                  )}
                </DynamicLink>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Search Spotlight Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-all active:scale-95"
              title="Search (Ctrl+K / Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                ⌘K
              </kbd>
            </button>

            <DynamicLink
              href="/tools"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all active:scale-95 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Semua Tools</span>
            </DynamicLink>
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Navigation Bar (Ergonomic Thumb Reach with Dynamic Tokens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08090d]/90 backdrop-blur-xl border-t border-slate-800/90 px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="flex items-center justify-around">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <DynamicLink
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 min-w-[56px] cursor-pointer",
                  isActive
                    ? "text-indigo-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all",
                    isActive
                      ? "bg-indigo-600/20 border border-indigo-500/40 shadow-sm"
                      : "bg-transparent"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium tracking-tight">
                  {link.label}
                </span>
              </DynamicLink>
            );
          })}

          {/* Quick Search Action */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-indigo-400 transition-all min-w-[56px]"
          >
            <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <Search className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-[10px] font-medium tracking-tight">
              Cari
            </span>
          </button>
        </div>
      </div>

      {/* Spotlight Command Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  );
}

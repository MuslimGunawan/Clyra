"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  Wrench, 
  Sparkles, 
  FolderGit2, 
  Compass, 
  Layers, 
  Search, 
  X,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import CommandPalette from "./CommandPalette";
import DynamicLink from "./DynamicLink";
import HeaderStatusWidget from "./HeaderStatusWidget";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showBetaBar, setShowBetaBar] = useState(true);
  const [logoTapCount, setLogoTapCount] = useState(0);

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

  // Reset logo tap counter after 3 seconds
  useEffect(() => {
    if (logoTapCount > 0) {
      const timer = setTimeout(() => setLogoTapCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoTapCount]);

  const handleLogoTap = () => {
    const nextCount = logoTapCount + 1;
    if (nextCount >= 5) {
      setLogoTapCount(0);
      window.dispatchEvent(new Event("clyra_open_admin_vault"));
    } else {
      setLogoTapCount(nextCount);
    }
  };

  const navLinks = [
    { href: "/", label: t("nav.home"), icon: Compass },
    { href: "/tools", label: t("nav.tools"), icon: Wrench, badge: "11" },
    { href: "/projects/prompts", label: t("nav.prompts"), icon: Sparkles },
    { href: "/projects/web", label: t("nav.web"), icon: FolderGit2 },
  ];

  return (
    <>
      {/* Pinned Sticky Header Container (Fixes Mobile Header Half-Clipped Issue) */}
      <div className="sticky top-0 z-40 w-full bg-[#08090d]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-md">
        {/* Early Access / Announcement Notice Bar */}
        {showBetaBar && (
          <div className="bg-gradient-to-r from-indigo-950/90 via-purple-950/70 to-indigo-950/90 border-b border-indigo-500/30 px-4 py-1.5 text-[11px] text-indigo-200 flex items-center justify-between gap-3 font-mono">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 text-center sm:text-left justify-center flex-1">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-500/40 text-[10px]">
                Clyra Hub (Early Access)
              </span>
              <span className="text-slate-300 hidden sm:inline">
                Suite Utilitas Produktivitas &amp; Developer 100% Client-Side
              </span>
              <button
                onClick={() => window.dispatchEvent(new Event("clyra_open_changelog"))}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600/40 hover:bg-indigo-600/70 text-indigo-200 border border-indigo-400/40 text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <History className="w-3 h-3 text-indigo-300" />
                <span>Changelog v2.0.0</span>
              </button>
            </div>
            <button
              onClick={() => setShowBetaBar(false)}
              className="text-indigo-400 hover:text-white transition-colors p-1 cursor-pointer"
              title="Tutup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Top Header */}
        <header className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
            {/* Left: Brand Logo with 5-Tap Secret Admin Easter Egg */}
            <div className="flex items-center gap-2.5 group shrink-0 select-none">
              <div 
                onClick={handleLogoTap}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300 cursor-pointer active:scale-95"
                title="Clyra Workspace"
              >
                <div className="w-full h-full bg-[#090b10] rounded-[7px] flex items-center justify-center">
                  <Layers className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <DynamicLink href="/" className="flex flex-col cursor-pointer">
                <span className="font-bold tracking-tight text-white text-base group-hover:text-indigo-300 transition-colors">
                  Clyra<span className="text-indigo-400">.</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono -mt-1 tracking-wider uppercase">
                  Productivity Hub
                </span>
              </DynamicLink>
            </div>

            {/* Middle: Desktop Navigation */}
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

            {/* Right: Live Clock/Weather Widget + Search Spotlight + Language Selector */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Live Clock & Zero-Permission Weather */}
              <HeaderStatusWidget />

              {/* Search Trigger */}
              <button
                onClick={() => setIsCommandOpen(true)}
                className="flex items-center justify-between gap-3 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-all active:scale-95 w-auto sm:w-44 md:w-52 shadow-sm group"
                title="Cari Tool, Prompt, atau Projek (Ctrl+K / Cmd+K)"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline text-slate-400 group-hover:text-slate-200 text-xs">
                    {t("nav.search_placeholder")}
                  </span>
                  <span className="sm:hidden font-medium text-slate-300 text-xs">{t("nav.search")}</span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-slate-800/90 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                  ⌘K
                </kbd>
              </button>

              {/* Multi-Language Dropdown Selector */}
              <LanguageSelector />
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Bottom Navigation Bar (Always Visible & Fully Formatted) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#090b11]/95 backdrop-blur-2xl border-t border-slate-800/90 px-2 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.85)]"
      >
        <div className="grid grid-cols-4 items-center justify-items-center">
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
                  "flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition-all duration-200 w-full max-w-[76px] cursor-pointer",
                  isActive
                    ? "text-indigo-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200 active:scale-95"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all flex items-center justify-center",
                    isActive
                      ? "bg-indigo-600/20 border border-indigo-500/40 shadow-sm"
                      : "bg-slate-900/40 border border-slate-800/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] tracking-tight truncate max-w-[70px]">
                  {link.label}
                </span>
              </DynamicLink>
            );
          })}
        </div>
      </nav>

      {/* Spotlight Command Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  );
}

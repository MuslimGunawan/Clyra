"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Palette, 
  MousePointer, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Check, 
  RotateCcw, 
  Sliders, 
  X, 
  Sun, 
  Moon, 
  Monitor, 
  Compass, 
  Layers, 
  ChevronRight, 
  ChevronLeft,
  Eye,
  Type,
  Zap,
  Globe,
  HelpCircle,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

// Predefined Crisp SVG Cursor Data URIs
const CURSOR_PRESETS = [
  {
    id: "default",
    name: "Sistem Standar",
    desc: "Kursor bawaan sistem operasi Anda",
    preview: "↖",
    cursorCss: "auto",
    pointerCss: "pointer",
  },
  {
    id: "neon_glow",
    name: "Cyber Neon Glow",
    desc: "Panah futuristik dengan garis tepi neon menyala",
    preview: "✦",
    cursorCss: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%236366f1" stroke="%2338bdf8" stroke-width="1.5"><polygon points="3,3 3,21 9,15 15,21 17,19 11,13 19,13"/></svg>') 3 3, auto`,
    pointerCss: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="%23ec4899" stroke="%23ffffff" stroke-width="1.5"><circle cx="14" cy="14" r="5"/><polygon points="14,2 14,8 14,20 14,26"/><polygon points="2,14 8,14 20,14 26,14"/></svg>') 14 14, pointer`,
  },
  {
    id: "cyber_crosshair",
    name: "Tactical Crosshair",
    desc: "Garis bidik presisi tinggi bergaya gaming/teknologi",
    preview: "✛",
    cursorCss: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2"><circle cx="12" cy="12" r="7"/><line x1="12" y1="2" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="22"/><line x1="2" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="1.5" fill="%2310b981"/></svg>') 12 12, crosshair`,
    pointerCss: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="%2310b981" stroke="%23ffffff" stroke-width="1.5"><circle cx="14" cy="14" r="8" fill="none"/><circle cx="14" cy="14" r="3"/><line x1="14" y1="2" x2="14" y2="8"/><line x1="14" y1="20" x2="14" y2="26"/><line x1="2" y1="14" x2="8" y2="14"/><line x1="20" y1="14" x2="26" y2="14"/></svg>') 14 14, pointer`,
  },
  {
    id: "magic_sparkle",
    name: "Magic Sparkle Wand",
    desc: "Tongkat sihir estetik dengan efek bintang berkilau",
    preview: "🪄",
    cursorCss: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23a855f7" stroke="%23ffffff" stroke-width="1.5"><path d="m19 5-3-3-13 13 3 3 13-13Z"/><path d="m14 7 3 3"/><path d="m9 2 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" fill="%23fbbf24"/></svg>') 4 4, auto`,
    pointerCss: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23f43f5e" stroke="%23ffffff" stroke-width="1.5"><path d="m12 3 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z"/></svg>') 12 12, pointer`,
  },
  {
    id: "retro_pixel",
    name: "8-Bit Retro Pixel",
    desc: "Kursor klasik bernuansa game arkade retro",
    preview: "👾",
    cursorCss: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" shape-rendering="crispEdges"><rect x="1" y="1" width="2" height="15" fill="%23000"/><rect x="3" y="1" width="2" height="13" fill="%23fff"/><rect x="5" y="3" width="2" height="11" fill="%23fff"/><rect x="7" y="5" width="2" height="9" fill="%23fff"/><rect x="9" y="7" width="2" height="7" fill="%23fff"/><rect x="11" y="9" width="2" height="5" fill="%23fff"/><rect x="13" y="11" width="2" height="3" fill="%23fff"/><rect x="15" y="13" width="2" height="1" fill="%23fff"/><rect x="3" y="14" width="2" height="2" fill="%23000"/><rect x="5" y="12" width="2" height="2" fill="%23000"/><rect x="7" y="10" width="2" height="2" fill="%23000"/></svg>') 1 1, auto`,
    pointerCss: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" shape-rendering="crispEdges"><rect x="4" y="2" width="4" height="12" fill="%23fff" stroke="%23000"/><rect x="8" y="6" width="8" height="8" fill="%236366f1" stroke="%23000"/></svg>') 6 2, pointer`,
  },
  {
    id: "minimal_dot",
    name: "Minimalist Ring & Dot",
    desc: "Titik bulat halus dengan ring lingkaran minimalis",
    preview: "◎",
    cursorCss: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4" fill="%23ffffff" stroke="%236366f1" stroke-width="1.5"/></svg>') 10 10, auto`,
    pointerCss: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="%23a855f7" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="%23ffffff"/></svg>') 12 12, pointer`,
  },
];

// Predefined Themes
const THEMES = [
  {
    id: "clyra_dark",
    name: "Clyra Dark (Standar)",
    desc: "Midnight obsidian dengan aksen indigo modern",
    bg: "#08090d",
    cardBg: "#0e111a",
    accent: "#6366f1",
    isDark: true,
  },
  {
    id: "oled_black",
    name: "OLED Pure Black",
    desc: "Hitam pekat 100% hemat baterai dengan aksen cyan",
    bg: "#000000",
    cardBg: "#080808",
    accent: "#00f2fe",
    isDark: true,
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    desc: "Ungu gelap dengan aksen neon pink & electric blue",
    bg: "#0d0221",
    cardBg: "#1a0836",
    accent: "#f72585",
    isDark: true,
  },
  {
    id: "emerald_matrix",
    name: "Emerald Terminal",
    desc: "Hijau hacker matrix dengan aksen emerald tajam",
    bg: "#02140d",
    cardBg: "#06261b",
    accent: "#10b981",
    isDark: true,
  },
  {
    id: "nordic_twilight",
    name: "Nordic Twilight",
    desc: "Biru arktik dingin dengan suasana malam tenang",
    bg: "#0b1320",
    cardBg: "#131f33",
    accent: "#38bdf8",
    isDark: true,
  },
  {
    id: "clean_light",
    name: "Clean Paper Light",
    desc: "Tema terang kontras tinggi untuk siang hari",
    bg: "#f8fafc",
    cardBg: "#ffffff",
    accent: "#4f46e5",
    isDark: false,
  },
];

export default function WorkspaceCustomizer() {
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"cursor" | "theme" | "fx">("cursor");

  // User Settings State
  const [cursorId, setCursorId] = useState<string>("default");
  const [customCursorUrl, setCustomCursorUrl] = useState<string>("");
  const [themeId, setThemeId] = useState<string>("clyra_dark");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [backgroundFx, setBackgroundFx] = useState<"grid" | "stars" | "ambient" | "solid">("grid");

  // Load Preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("clyra_workspace_prefs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cursorId) setCursorId(parsed.cursorId);
        if (parsed.customCursorUrl) setCustomCursorUrl(parsed.customCursorUrl);
        if (parsed.themeId) setThemeId(parsed.themeId);
        if (typeof parsed.soundEnabled === "boolean") setSoundEnabled(parsed.soundEnabled);
        if (parsed.backgroundFx) setBackgroundFx(parsed.backgroundFx);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save Preferences to localStorage
  const savePrefs = (updates: Partial<{
    cursorId: string;
    customCursorUrl: string;
    themeId: string;
    soundEnabled: boolean;
    backgroundFx: string;
  }>) => {
    try {
      const current = {
        cursorId,
        customCursorUrl,
        themeId,
        soundEnabled,
        backgroundFx,
        ...updates,
      };
      localStorage.setItem("clyra_workspace_prefs", JSON.stringify(current));
    } catch {
      // ignore
    }
  };

  // Play Pleasant Web Audio Synthesizer Click Sound
  const playClickSound = (freq = 600, duration = 0.04) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore audio errors
    }
  };

  // Apply Cursor to Document Body
  useEffect(() => {
    const selectedPreset = CURSOR_PRESETS.find((c) => c.id === cursorId);
    let finalCursor = selectedPreset ? selectedPreset.cursorCss : "auto";
    let finalPointer = selectedPreset ? selectedPreset.pointerCss : "pointer";

    if (cursorId === "custom_url" && customCursorUrl.trim()) {
      finalCursor = `url('${customCursorUrl.trim()}'), auto`;
      finalPointer = `url('${customCursorUrl.trim()}'), pointer`;
    }

    // Inject dynamic global style for cursor
    const styleId = "clyra-custom-cursor-style";
    let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    if (cursorId === "default") {
      styleTag.innerHTML = "";
    } else {
      styleTag.innerHTML = `
        * { cursor: ${finalCursor} !important; }
        a, button, [role="button"], input[type="submit"], input[type="button"], select, .cursor-pointer {
          cursor: ${finalPointer} !important;
        }
      `;
    }
  }, [cursorId, customCursorUrl]);

  // Apply Theme CSS Variables to Root & Body
  useEffect(() => {
    const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
    const root = document.documentElement;
    const body = document.body;

    if (theme.id === "clean_light") {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.setProperty("--background", "#f8fafc");
      root.style.setProperty("--foreground", "#0f172a");
      root.style.setProperty("--card", "#ffffff");
      root.style.setProperty("--card-border", "#e2e8f0");
      root.style.setProperty("--accent", "#4f46e5");
      body.style.backgroundColor = "#f8fafc";
      body.style.color = "#0f172a";
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      root.style.setProperty("--background", theme.bg);
      root.style.setProperty("--foreground", "#f1f5f9");
      root.style.setProperty("--card", theme.cardBg);
      root.style.setProperty("--card-border", "#1e2230");
      root.style.setProperty("--accent", theme.accent);
      body.style.backgroundColor = theme.bg;
      body.style.color = "#f1f5f9";
    }
  }, [themeId]);

  // Reset to Default Preferences
  const handleResetAll = () => {
    setCursorId("default");
    setCustomCursorUrl("");
    setThemeId("clyra_dark");
    setSoundEnabled(true);
    setBackgroundFx("grid");
    savePrefs({
      cursorId: "default",
      customCursorUrl: "",
      themeId: "clyra_dark",
      soundEnabled: true,
      backgroundFx: "grid",
    });
    playClickSound(400, 0.08);
    showToast("Workspace telah direset ke pengaturan standar!", "info");
  };

  return (
    <>
      {/* 1. FLOATING RIGHT-EDGE DOCK TRIGGER */}
      <div className="fixed top-1/2 -translate-y-1/2 right-0 z-40 flex items-center">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            playClickSound(750, 0.05);
          }}
          className={cn(
            "flex items-center gap-2 pl-3 pr-2.5 py-3 rounded-l-2xl bg-gradient-to-l from-indigo-600 via-indigo-700 to-purple-800 text-white font-bold text-xs shadow-2xl shadow-indigo-600/50 hover:pl-4 transition-all duration-300 border-l border-y border-indigo-400/40 cursor-pointer group active:scale-95",
            isOpen && "translate-x-full opacity-0 pointer-events-none"
          )}
          title="Kustomisasi Workspace (Ganti Kursor, Tema & Suara)"
        >
          <div className="flex flex-col items-center gap-1">
            <Palette className="w-4 h-4 text-white group-hover:rotate-12 transition-transform animate-pulse" />
            <span className="[writing-mode:vertical-rl] text-[10px] uppercase font-mono tracking-widest font-bold">
              Workspace
            </span>
          </div>
        </button>
      </div>

      {/* 2. SLIDE-OUT WORKSPACE CUSTOMIZER DRAWER */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            setIsOpen(false);
            playClickSound(500, 0.04);
          }}
        >
          <div
            className="w-full max-w-md bg-[#0e111a] border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#090b10]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-md">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Kelola Workspace Anda</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Kustomisasi Kursor, Warna Tema &amp; Suara Efek
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  playClickSound(500, 0.04);
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                title="Tutup Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-3 bg-[#08090d] border-b border-slate-800/80 text-xs">
              <button
                onClick={() => {
                  setActiveTab("cursor");
                  playClickSound(650, 0.03);
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition-all cursor-pointer",
                  activeTab === "cursor"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                )}
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span>Kursor</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("theme");
                  playClickSound(650, 0.03);
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition-all cursor-pointer",
                  activeTab === "theme"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                )}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Tema &amp; Warna</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("fx");
                  playClickSound(650, 0.03);
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold transition-all cursor-pointer",
                  activeTab === "fx"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                )}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Audio &amp; FX</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 leading-relaxed">
              {/* TAB 1: CURSOR SELECTOR */}
              {activeTab === "cursor" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      Pilihan Kursor Web
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
                      Instan Aktif
                    </span>
                  </div>

                  {/* Preset Grid */}
                  <div className="space-y-2.5">
                    {CURSOR_PRESETS.map((cur) => {
                      const isSelected = cursorId === cur.id;
                      return (
                        <div
                          key={cur.id}
                          onClick={() => {
                            setCursorId(cur.id);
                            savePrefs({ cursorId: cur.id });
                            playClickSound(700, 0.04);
                            showToast(`Kursor diubah ke "${cur.name}"`, "info");
                          }}
                          className={cn(
                            "p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer shadow-sm group",
                            isSelected
                              ? "bg-indigo-600/20 border-indigo-500 shadow-indigo-500/10"
                              : "bg-[#08090d] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg font-mono group-hover:scale-110 transition-transform">
                              {cur.preview}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span>{cur.name}</span>
                                {isSelected && (
                                  <span className="text-[9px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded font-mono font-bold">
                                    Aktif
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{cur.desc}</div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-slate-700" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom URL Option */}
                  <div className="p-4 bg-[#08090d] border border-slate-800 rounded-2xl space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                        Gunakan URL Gambar Kursor Kustom
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Anda bisa menempel URL gambar (.png atau .svg 32x32) dari situs seperti <strong className="text-indigo-300">custom-cursor.com</strong>.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="url"
                        value={customCursorUrl}
                        onChange={(e) => {
                          setCustomCursorUrl(e.target.value);
                          setCursorId("custom_url");
                          savePrefs({ cursorId: "custom_url", customCursorUrl: e.target.value });
                        }}
                        placeholder="https://.../cursor.png"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-500 outline-none"
                      />
                      <button
                        onClick={() => {
                          if (customCursorUrl) {
                            setCursorId("custom_url");
                            savePrefs({ cursorId: "custom_url", customCursorUrl });
                            playClickSound(800, 0.04);
                            showToast("Kursor kustom URL diterapkan!", "success");
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 cursor-pointer"
                      >
                        Pasang
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: THEME & COLOR SELECTOR */}
              {activeTab === "theme" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      Tema &amp; Palet Estetik
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {THEMES.length} Tema Tersedia
                    </span>
                  </div>

                  <div className="space-y-3">
                    {THEMES.map((th) => {
                      const isSelected = themeId === th.id;
                      return (
                        <div
                          key={th.id}
                          onClick={() => {
                            setThemeId(th.id);
                            savePrefs({ themeId: th.id });
                            playClickSound(600, 0.05);
                            showToast(`Tema diubah ke "${th.name}"`, "info");
                          }}
                          className={cn(
                            "p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer shadow-sm group",
                            isSelected
                              ? "bg-indigo-600/20 border-indigo-500 shadow-indigo-500/10"
                              : "bg-[#08090d] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                          )}
                        >
                          <div className="flex items-center gap-3.5">
                            {/* Color Swatch Circle */}
                            <div
                              className="w-10 h-10 rounded-2xl border-2 shadow-inner flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                              style={{ backgroundColor: th.bg, borderColor: th.accent }}
                            >
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: th.accent }}
                              />
                            </div>

                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span>{th.name}</span>
                                {!th.isDark && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                                    Light Mode
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{th.desc}</div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-slate-700" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIO SFX & BACKGROUND FX */}
              {activeTab === "fx" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* UI Audio SFX */}
                  <div className="p-4 bg-[#08090d] border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Efek Suara Antarmuka (SFX)</span>
                          <span className="text-[10px] text-slate-400">Audio sintetis halus saat mengklik tombol</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const nextState = !soundEnabled;
                          setSoundEnabled(nextState);
                          savePrefs({ soundEnabled: nextState });
                          if (nextState) playClickSound(800, 0.05);
                        }}
                        className={cn(
                          "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                          soundEnabled ? "bg-indigo-600" : "bg-slate-800"
                        )}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full bg-white transition-transform absolute top-1",
                            soundEnabled ? "left-6" : "left-1"
                          )}
                        />
                      </button>
                    </div>

                    {soundEnabled && (
                      <button
                        onClick={() => playClickSound(880, 0.06)}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs font-mono border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Tes Suara Interaksi</span>
                      </button>
                    )}
                  </div>

                  {/* Quick Reset All */}
                  <div className="p-4 bg-[#08090d] border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-white block">Reset Pengaturan Workspace</span>
                    <p className="text-[11px] text-slate-400">
                      Kembalikan kursor, tema warna, dan audio ke pengaturan awal standar pabrik Clyra.
                    </p>
                    <button
                      onClick={handleResetAll}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-800 hover:border-red-900/50 text-xs font-bold transition-colors cursor-pointer mt-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Kembalikan ke Default</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-[#090b10] border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tersimpan Otomatis di Browser</span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  playClickSound(500, 0.04);
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

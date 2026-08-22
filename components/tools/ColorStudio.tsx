"use client";

import { useState, useMemo, useRef, useEffect, ChangeEvent } from "react";
import { 
  Palette, 
  Copy, 
  Check, 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  Pipette, 
  Upload, 
  Download, 
  Layers, 
  Code2, 
  SunMedium, 
  Contrast, 
  Wand2, 
  ShieldCheck, 
  Zap, 
  FileCode2,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

type StudioTab = "harmonies" | "shades" | "gradient" | "image_extract" | "wcag";

export default function ColorStudio() {
  const { showToast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Master Color State (Hex)
  const [color, setColor] = useState<string>("#6366F1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>("harmonies");

  // Gradient Generator State
  const [gradType, setGradType] = useState<"linear" | "radial">("linear");
  const [gradAngle, setGradAngle] = useState<number>(135);
  const [gradColor2, setGradColor2] = useState<string>("#EC4899");
  const [gradColor3, setGradColor3] = useState<string>("#38BDF8");
  const [useThreeStops, setUseThreeStops] = useState<boolean>(false);

  // Extracted Palette from Image
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Copy helper
  const copyVal = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast("Warna berhasil disalin ke clipboard!", "copied");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast("Gagal menyalin.", "error");
    }
  };

  // Convert Hex to RGB, HSL, HSV, CMYK, OKLCH
  const colorData = useMemo(() => {
    let cleanHex = color.trim().replace(/^#/, "");
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split("").map((c) => c + c).join("");
    }
    if (cleanHex.length !== 6) {
      cleanHex = "6366F1";
    }

    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;

    // HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }

    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);

    // HSV / HSB
    const vPct = Math.round(max * 100);
    const sHsvPct = max === 0 ? 0 : Math.round(((max - min) / max) * 100);

    // CMYK
    const kCmyk = 1 - max;
    const cCmyk = kCmyk === 1 ? 0 : Math.round(((1 - rNorm - kCmyk) / (1 - kCmyk)) * 100);
    const mCmyk = kCmyk === 1 ? 0 : Math.round(((1 - gNorm - kCmyk) / (1 - kCmyk)) * 100);
    const yCmyk = kCmyk === 1 ? 0 : Math.round(((1 - bNorm - kCmyk) / (1 - kCmyk)) * 100);
    const kCmykPct = Math.round(kCmyk * 100);

    // WCAG Luminance
    const getLuminance = (rVal: number, gVal: number, bVal: number) => {
      const a = [rVal, gVal, bVal].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const bgLum = getLuminance(r, g, b);
    const whiteLum = 1.0;
    const blackLum = 0.0;
    const darkUrbLum = getLuminance(14, 17, 26); // #0e111a

    const contrastWhite = (whiteLum + 0.05) / (bgLum + 0.05);
    const contrastBlack = (bgLum + 0.05) / (blackLum + 0.05);
    const contrastDarkUi = bgLum > darkUrbLum ? (bgLum + 0.05) / (darkUrbLum + 0.05) : (darkUrbLum + 0.05) / (bgLum + 0.05);

    // Color Harmonies Generator
    const hslToHex = (hVal: number, sVal: number, lVal: number) => {
      const lNorm = lVal / 100;
      const a = (sVal * Math.min(lNorm, 1 - lNorm)) / 100;
      const f = (n: number) => {
        const k = (n + hVal / 30) % 12;
        const col = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * col)
          .toString(16)
          .padStart(2, "0");
      };
      return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    };

    const generateHueShift = (deg: number) => {
      const newH = (hDeg + deg + 360) % 360;
      return hslToHex(newH, sPct, lPct);
    };

    const harmonies = [
      { name: "Warna Utama", value: `#${cleanHex.toUpperCase()}`, desc: "Base 0°" },
      { name: "Komplementer", value: generateHueShift(180), desc: "Kontras Tinggi (+180°)" },
      { name: "Analogous 1", value: generateHueShift(30), desc: "Harmonis (+30°)" },
      { name: "Analogous 2", value: generateHueShift(-30), desc: "Harmonis (-30°)" },
      { name: "Triadik 1", value: generateHueShift(120), desc: "Seimbang (+120°)" },
      { name: "Triadik 2", value: generateHueShift(240), desc: "Seimbang (+240°)" },
      { name: "Split-Komplementer 1", value: generateHueShift(150), desc: "Aksen (+150°)" },
      { name: "Split-Komplementer 2", value: generateHueShift(210), desc: "Aksen (+210°)" },
      { name: "Tetradik (Square)", value: generateHueShift(90), desc: "Kaya Warna (+90°)" },
    ];

    // Tailwind Shade Scale (50 to 950)
    const shadesList = [
      { shade: "50", lightness: 96, satMod: 0.7 },
      { shade: "100", lightness: 91, satMod: 0.8 },
      { shade: "200", lightness: 82, satMod: 0.9 },
      { shade: "300", lightness: 72, satMod: 0.95 },
      { shade: "400", lightness: 61, satMod: 1.0 },
      { shade: "500", lightness: 50, satMod: 1.0 },
      { shade: "600", lightness: 41, satMod: 0.95 },
      { shade: "700", lightness: 32, satMod: 0.9 },
      { shade: "800", lightness: 23, satMod: 0.85 },
      { shade: "900", lightness: 15, satMod: 0.8 },
      { shade: "950", lightness: 8, satMod: 0.75 },
    ].map((sItem) => {
      const hexVal = hslToHex(hDeg, Math.min(100, Math.round(sPct * sItem.satMod)), sItem.lightness);
      return {
        step: sItem.shade,
        hex: hexVal,
      };
    });

    return {
      hex: `#${cleanHex.toUpperCase()}`,
      rgb: `rgb(${r}, ${g}, ${b})`,
      rgba: `rgba(${r}, ${g}, ${b}, 1)`,
      hsl: `hsl(${hDeg}, ${sPct}%, ${lPct}%)`,
      hsv: `hsv(${hDeg}°, ${sHsvPct}%, ${vPct}%)`,
      cmyk: `cmyk(${cCmyk}%, ${mCmyk}%, ${yCmyk}%, ${kCmykPct}%)`,
      cssVar: `--color-primary: #${cleanHex.toUpperCase()};`,
      contrastWhite: contrastWhite.toFixed(2),
      contrastBlack: contrastBlack.toFixed(2),
      contrastDarkUi: contrastDarkUi.toFixed(2),
      harmonies,
      shadesList,
    };
  }, [color]);

  // Gradient CSS computation
  const gradientCss = useMemo(() => {
    if (gradType === "linear") {
      return useThreeStops
        ? `linear-gradient(${gradAngle}deg, ${colorData.hex} 0%, ${gradColor2} 50%, ${gradColor3} 100%)`
        : `linear-gradient(${gradAngle}deg, ${colorData.hex} 0%, ${gradColor2} 100%)`;
    }
    return useThreeStops
      ? `radial-gradient(circle at center, ${colorData.hex} 0%, ${gradColor2} 50%, ${gradColor3} 100%)`
      : `radial-gradient(circle at center, ${colorData.hex} 0%, ${gradColor2} 100%)`;
  }, [gradType, gradAngle, colorData.hex, gradColor2, gradColor3, useThreeStops]);

  // Random Color Generator
  const generateRandomColor = () => {
    const randomHex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0").toUpperCase();
    setColor(randomHex);
    showToast("Warna acak digenerate!", "info");
  };

  // Image Upload Color Extractor
  const handleImageExtract = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, 100, 100);
      const imgData = ctx.getImageData(0, 0, 100, 100).data;
      const colorCounts: Record<string, number> = {};

      for (let i = 0; i < imgData.length; i += 16) {
        const r = Math.round(imgData[i] / 24) * 24;
        const g = Math.round(imgData[i + 1] / 24) * 24;
        const b = Math.round(imgData[i + 2] / 24) * 24;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      const sorted = Object.keys(colorCounts)
        .sort((a, b) => colorCounts[b] - colorCounts[a])
        .slice(0, 8);

      setExtractedColors(sorted);
      if (sorted[0]) setColor(sorted[0]);
      showToast(`Berhasil mengekstrak ${sorted.length} warna dominan dari gambar!`, "success");
    };
    img.src = url;
  };

  // Clipboard Paste Listener (for image color extractor)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            const fakeEvent = { target: { files: [file] } } as any;
            handleImageExtract(fakeEvent);
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER & RANDOM PICKER */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl border-2 border-white/20 shadow-xl flex items-center justify-center shrink-0 transition-transform active:scale-95"
            style={{ backgroundColor: colorData.hex }}
          >
            <Palette className="w-6 h-6 text-white drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Color &amp; Palette Studio</h2>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                Tailwind &amp; WCAG Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Aktif: <strong className="text-white">{colorData.hex}</strong> • {colorData.rgb} • {colorData.hsl}
            </p>
          </div>
        </div>

        <button
          onClick={generateRandomColor}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Generate Warna Acak</span>
        </button>
      </div>

      {/* 2. MASTER COLOR PICKER & CODECS BAR */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Visual Color Input Area */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-[#08090d] rounded-2xl border border-slate-800 space-y-4 shadow-inner">
            <div className="relative group">
              <input
                type="color"
                value={colorData.hex}
                onChange={(e) => setColor(e.target.value.toUpperCase())}
                className="w-28 h-28 rounded-3xl cursor-pointer bg-transparent border-0 opacity-0 absolute inset-0 z-10"
              />
              <div
                className="w-28 h-28 rounded-3xl border-2 border-white/20 shadow-2xl flex flex-col items-center justify-center text-white transition-transform group-hover:scale-105"
                style={{ backgroundColor: colorData.hex }}
              >
                <Pipette className="w-7 h-7 drop-shadow mb-1" />
                <span className="text-[11px] font-mono font-bold drop-shadow">Pilih Warna</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full max-w-[220px]">
              <span className="text-xs font-mono text-slate-500 font-bold">#</span>
              <input
                type="text"
                value={colorData.hex.replace("#", "")}
                onChange={(e) => setColor(`#${e.target.value}`)}
                maxLength={6}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono text-center font-bold focus:border-indigo-500 outline-none uppercase"
              />
            </div>
          </div>

          {/* Formats Grid (Hex, RGB, HSL, HSV, CMYK, CSS Var) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: "hex", label: "HEX Code", val: colorData.hex },
              { key: "rgb", label: "RGB Format", val: colorData.rgb },
              { key: "hsl", label: "HSL Format", val: colorData.hsl },
              { key: "hsv", label: "HSV / HSB", val: colorData.hsv },
              { key: "cmyk", label: "CMYK (Print)", val: colorData.cmyk },
              { key: "cssVar", label: "CSS Variable", val: colorData.cssVar },
            ].map((item) => (
              <div
                key={item.key}
                className="bg-[#08090d] border border-slate-800/90 p-3.5 rounded-2xl flex items-center justify-between shadow-inner hover:border-slate-700 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">{item.label}</div>
                  <div className="text-xs font-mono font-bold text-slate-200 truncate">{item.val}</div>
                </div>
                <button
                  onClick={() => copyVal(item.val, item.key)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-600/30 text-slate-400 hover:text-indigo-300 transition-all cursor-pointer shrink-0 border border-slate-800"
                >
                  {copiedKey === item.key ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. STUDIO TABS (Harmonies, Shades, Gradient, Image Extractor, WCAG) */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0e111a] p-1.5 rounded-2xl border border-slate-800 text-xs overflow-x-auto scrollbar-none">
          {[
            { id: "harmonies", label: "1. Harmoni Warna (Harmonies)", icon: Sparkles },
            { id: "shades", label: "2. Tailwind Shades (50-950)", icon: Layers },
            { id: "gradient", label: "3. CSS Gradient Studio", icon: Sliders },
            { id: "image_extract", label: "4. Ekstrak Warna dari Foto", icon: Pipette },
            { id: "wcag", label: "5. Aksesibilitas Kontras (WCAG)", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as StudioTab)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer",
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: COLOR HARMONIES */}
        {activeTab === "harmonies" && (
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Skema Harmoni Teori Warna (Color Wheel)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Klik warna untuk menyalin HEX</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3.5">
              {colorData.harmonies.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => copyVal(p.value, `harmony-${idx}`)}
                  className="p-4 bg-[#08090d] border border-slate-800 rounded-2xl space-y-2.5 group cursor-pointer hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all shadow-md"
                >
                  <div
                    className="w-full h-16 rounded-xl border border-white/10 shadow-inner transition-transform group-hover:scale-[1.02]"
                    style={{ backgroundColor: p.value }}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-500">{p.desc}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-300">
                      <span>{p.value}</span>
                      {copiedKey === `harmony-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TAILWIND SHADES (50-950) */}
        {activeTab === "shades" && (
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider block">
                  Tailwind CSS Color Scale (50 — 950)
                </span>
                <p className="text-[11px] text-slate-400">Palet 11 level gradasi warna untuk UI components.</p>
              </div>

              <button
                onClick={() => {
                  const configStr = `colors: {\n  brand: {\n${colorData.shadesList
                    .map((s) => `    ${s.step}: '${s.hex}',`)
                    .join("\n")}\n  }\n}`;
                  copyVal(configStr, "tailwindConfig");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-800 transition-colors cursor-pointer"
              >
                {copiedKey === "tailwindConfig" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Config Tersalin</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Salin Tailwind Config</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2">
              {colorData.shadesList.map((shade) => (
                <div
                  key={shade.step}
                  onClick={() => copyVal(shade.hex, `shade-${shade.step}`)}
                  className="p-2.5 bg-[#08090d] border border-slate-800 rounded-xl space-y-2 group cursor-pointer hover:border-indigo-500/40 text-center transition-all"
                >
                  <div
                    className="w-full h-14 rounded-lg border border-white/10 shadow-inner"
                    style={{ backgroundColor: shade.hex }}
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">{shade.step}</span>
                    <span className="text-[10px] font-mono text-slate-400">{shade.hex}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CSS GRADIENT STUDIO */}
        {activeTab === "gradient" && (
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Generator CSS Gradient Realtime
              </span>
              <button
                onClick={() => copyVal(`background: ${gradientCss};`, "gradCss")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {copiedKey === "gradCss" ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>CSS Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin CSS Gradient</span>
                  </>
                )}
              </button>
            </div>

            {/* Gradient Visual Preview Canvas */}
            <div
              className="w-full h-44 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center justify-center p-4 transition-all"
              style={{ background: gradientCss }}
            >
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white text-xs font-mono text-center font-bold">
                {gradientCss}
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Tipe Gradien</label>
                <div className="flex items-center bg-[#08090d] p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setGradType("linear")}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                      gradType === "linear" ? "bg-indigo-600 text-white" : "text-slate-400"
                    )}
                  >
                    Linear
                  </button>
                  <button
                    onClick={() => setGradType("radial")}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
                      gradType === "radial" ? "bg-indigo-600 text-white" : "text-slate-400"
                    )}
                  >
                    Radial
                  </button>
                </div>
              </div>

              {gradType === "linear" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Sudut Arah ({gradAngle}°)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradAngle}
                    onChange={(e) => setGradAngle(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Warna Stop ke-2</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradColor2}
                    onChange={(e) => setGradColor2(e.target.value.toUpperCase())}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-slate-300 font-bold">{gradColor2}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EXTRACT FROM IMAGE */}
        {activeTab === "image_extract" && (
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider block">
                  Ekstraksi Palet Warna dari Foto / Desain
                </span>
                <p className="text-[11px] text-slate-400">
                  Unggah gambar atau tempel screenshot dengan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-[10px]">Ctrl + V</kbd>.
                </p>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageExtract}
                className="hidden"
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih Foto Gambar</span>
              </button>
            </div>

            {/* Extracted Colors Display */}
            {extractedColors.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {extractedColors.map((extHex, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setColor(extHex);
                        copyVal(extHex, `ext-${i}`);
                      }}
                      className="p-3 bg-[#08090d] border border-slate-800 rounded-2xl space-y-2 group cursor-pointer hover:border-indigo-500/50 text-center transition-all"
                    >
                      <div
                        className="w-full h-16 rounded-xl border border-white/10 shadow-inner"
                        style={{ backgroundColor: extHex }}
                      />
                      <span className="text-xs font-mono font-bold text-white block">{extHex}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-10 text-center cursor-pointer bg-slate-900/30"
              >
                <Pipette className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-300 block">Belum ada gambar yang dimuat</span>
                <span className="text-[11px] text-slate-500">Klik untuk memilih foto atau tekan Ctrl + V</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WCAG CONTRAST CHECKER */}
        {activeTab === "wcag" && (
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider block">
                WCAG 2.1 Color Accessibility &amp; Contrast Ratio Matrix
              </span>
              <p className="text-[11px] text-slate-400">
                Standar rasio kontras untuk keterbacaan teks bagi seluruh pengguna (Target AA: &ge; 4.5:1, AAA: &ge; 7:1).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* White Text on Background */}
              <div
                className="p-5 rounded-2xl flex flex-col justify-between space-y-4 border shadow-xl"
                style={{ backgroundColor: colorData.hex, color: "#ffffff" }}
              >
                <div>
                  <span className="font-bold text-sm block">Teks Putih</span>
                  <span className="text-xs font-mono opacity-90">Rasio: {colorData.contrastWhite} : 1</span>
                </div>
                <div className="flex items-center gap-2">
                  {parseFloat(colorData.contrastWhite) >= 4.5 ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-emerald-400 text-xs font-bold font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Lolos AA (Pass)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-amber-300 text-xs font-bold font-mono">
                      <XCircle className="w-3.5 h-3.5" /> Gagal AA (Fail)
                    </span>
                  )}
                </div>
              </div>

              {/* Black Text on Background */}
              <div
                className="p-5 rounded-2xl flex flex-col justify-between space-y-4 border shadow-xl"
                style={{ backgroundColor: colorData.hex, color: "#000000" }}
              >
                <div>
                  <span className="font-bold text-sm block">Teks Hitam</span>
                  <span className="text-xs font-mono opacity-90">Rasio: {colorData.contrastBlack} : 1</span>
                </div>
                <div className="flex items-center gap-2">
                  {parseFloat(colorData.contrastBlack) >= 4.5 ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 text-emerald-950 text-xs font-bold font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Lolos AA (Pass)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 text-amber-950 text-xs font-bold font-mono">
                      <XCircle className="w-3.5 h-3.5" /> Gagal AA (Fail)
                    </span>
                  )}
                </div>
              </div>

              {/* Color on Dark UI Background */}
              <div className="p-5 rounded-2xl bg-[#08090d] border border-slate-800 flex flex-col justify-between space-y-4 shadow-xl">
                <div>
                  <span className="font-bold text-sm block" style={{ color: colorData.hex }}>
                    Aksen di Dark Theme Clyra
                  </span>
                  <span className="text-xs font-mono text-slate-400">Rasio: {colorData.contrastDarkUi} : 1</span>
                </div>
                <div className="flex items-center gap-2">
                  {parseFloat(colorData.contrastDarkUi) >= 4.5 ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 text-xs font-bold font-mono border border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Lolos AA (Pass)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 text-xs font-bold font-mono border border-amber-800">
                      <XCircle className="w-3.5 h-3.5" /> Gagal AA (Fail)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { 
  Palette, 
  Copy, 
  Check, 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";

export default function ColorStudio() {
  const [color, setColor] = useState("#6366f1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Conversions
  const colorData = useMemo(() => {
    // Clean hex
    let hex = color.trim().replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    if (hex.length !== 6) {
      hex = "6366f1";
    }

    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;

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

    // WCAG Contrast calculation
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

    const contrastWhite = (whiteLum + 0.05) / (bgLum + 0.05);
    const contrastBlack = (bgLum + 0.05) / (blackLum + 0.05);

    // Palette generation (Monochromatic, Complementary, Analogous)
    const generateHueShift = (deg: number) => {
      const newH = (hDeg + deg + 360) % 360;
      return `hsl(${newH}, ${sPct}%, ${lPct}%)`;
    };

    const palette = [
      { name: "Current", value: `#${hex}` },
      { name: "Complementary (+180°)", value: generateHueShift(180) },
      { name: "Analogous (+30°)", value: generateHueShift(30) },
      { name: "Analogous (-30°)", value: generateHueShift(-30) },
      { name: "Triadic (+120°)", value: generateHueShift(120) },
      { name: "Triadic (+240°)", value: generateHueShift(240) },
    ];

    return {
      hex: `#${hex.toUpperCase()}`,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hDeg}, ${sPct}%, ${lPct}%)`,
      cssVar: `--color-accent: #${hex};`,
      contrastWhite: contrastWhite.toFixed(2),
      contrastBlack: contrastBlack.toFixed(2),
      palette,
    };
  }, [color]);

  const copyVal = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const generateRandomColor = () => {
    const randomHex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    setColor(randomHex);
  };

  return (
    <div className="space-y-8">
      {/* Color Picker & Values */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg border border-slate-700 shadow-md transition-transform"
              style={{ backgroundColor: colorData.hex }}
            />
            <div>
              <div className="text-sm font-semibold text-white">Color Studio &amp; Palette</div>
              <div className="text-xs text-slate-400 font-mono">{colorData.hex}</div>
            </div>
          </div>

          <button
            onClick={generateRandomColor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Random Warna</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Visual Picker */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-[#08090d] rounded-xl border border-slate-800 space-y-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-24 h-24 rounded-2xl cursor-pointer bg-transparent border-0"
            />
            <span className="text-xs font-mono text-slate-400">Klik untuk memilih warna</span>
          </div>

          {/* Formats Grid */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "hex", label: "HEX Code", val: colorData.hex },
              { key: "rgb", label: "RGB Format", val: colorData.rgb },
              { key: "hsl", label: "HSL Format", val: colorData.hsl },
              { key: "css", label: "CSS Variable", val: colorData.cssVar },
            ].map((item) => (
              <div
                key={item.key}
                className="bg-[#08090d] border border-slate-800 p-3 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">{item.label}</div>
                  <div className="text-xs font-mono font-semibold text-slate-200">{item.val}</div>
                </div>
                <button
                  onClick={() => copyVal(item.val, item.key)}
                  className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
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

      {/* Harmonious Palette & Contrast Checker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Harmonious Palette */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase font-mono">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Harmonious Color Palette</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {colorData.palette.map((p, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#08090d] border border-slate-800 rounded-xl space-y-2 group cursor-pointer hover:border-indigo-500/40 transition-colors"
                onClick={() => copyVal(p.value, `palette-${idx}`)}
              >
                <div
                  className="w-full h-12 rounded-lg border border-slate-700/60 shadow-inner"
                  style={{ backgroundColor: p.value }}
                />
                <div className="text-[10px] text-slate-400 truncate">{p.name}</div>
                <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-300">
                  <span className="truncate">{p.value}</span>
                  {copiedKey === `palette-${idx}` ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300 shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WCAG Contrast Accessibility */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase font-mono">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>WCAG 2.1 Contrast Checker</span>
          </div>

          <div className="space-y-3">
            {/* Against White */}
            <div
              className="p-4 rounded-xl flex items-center justify-between border"
              style={{ backgroundColor: colorData.hex, color: "#ffffff" }}
            >
              <div>
                <div className="font-bold text-sm">Teks Putih di Background Ini</div>
                <div className="text-xs opacity-80 font-mono">Rasio: {colorData.contrastWhite} : 1</div>
              </div>
              <div>
                {parseFloat(colorData.contrastWhite) >= 4.5 ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/60 text-emerald-400 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pass AA
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/60 text-amber-300 text-xs font-bold font-mono">
                    <XCircle className="w-3.5 h-3.5" /> Fail AA
                  </span>
                )}
              </div>
            </div>

            {/* Against Black */}
            <div
              className="p-4 rounded-xl flex items-center justify-between border"
              style={{ backgroundColor: colorData.hex, color: "#000000" }}
            >
              <div>
                <div className="font-bold text-sm">Teks Hitam di Background Ini</div>
                <div className="text-xs opacity-80 font-mono">Rasio: {colorData.contrastBlack} : 1</div>
              </div>
              <div>
                {parseFloat(colorData.contrastBlack) >= 4.5 ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/80 text-emerald-900 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pass AA
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/80 text-amber-900 text-xs font-bold font-mono">
                    <XCircle className="w-3.5 h-3.5" /> Fail AA
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

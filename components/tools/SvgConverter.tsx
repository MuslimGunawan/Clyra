"use client";

import { useState, useMemo, ChangeEvent, useRef } from "react";
import { 
  FileCode2, 
  Copy, 
  Check, 
  Upload, 
  Trash2, 
  Sparkles, 
  Code2, 
  Eye, 
  Download, 
  Sliders, 
  Layers, 
  Maximize2, 
  Palette, 
  ShieldCheck, 
  RefreshCw,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeSvg } from "@/lib/security";
import { useToast } from "@/components/ToastProvider";

type OutputFormat = "jsx" | "tsx" | "vue" | "svelte" | "native" | "cssUri" | "minified";

export default function SvgConverter() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SVG Source Input
  const [svgInput, setSvgInput] = useState<string>(
`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
</svg>`
  );

  // Component Customization Settings
  const [componentName, setComponentName] = useState<string>("ClyraIcon");
  const [activeOutputTab, setActiveOutputTab] = useState<OutputFormat>("tsx");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Styling & Transformer Options
  const [useCurrentColor, setUseCurrentColor] = useState<boolean>(false);
  const [previewBg, setPreviewBg] = useState<"dark" | "checker" | "white" | "black">("dark");
  const [exportPngSize, setExportPngSize] = useState<number>(512);

  // Copy Value Helper
  const copyVal = async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast("Kode berhasil disalin ke clipboard!", "copied");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showToast("Gagal menyalin.", "error");
    }
  };

  // Upload SVG File
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSvgInput(content);
        const inferredName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "");
        if (inferredName) {
          setComponentName(inferredName.charAt(0).toUpperCase() + inferredName.slice(1) + "Icon");
        }
        showToast(`File "${file.name}" berhasil dimuat!`, "success");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Convert SVG to Various Frameworks & Formats
  const converted = useMemo(() => {
    if (!svgInput.trim()) {
      return {
        isValid: false,
        minified: "",
        cssUri: "",
        jsx: "",
        tsx: "",
        vue: "",
        svelte: "",
        native: "",
      };
    }

    try {
      // 1. Minify and sanitize SVG
      let cleanSvg = svgInput
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<\?xml[\s\S]*?\?>/g, "")
        .replace(/<!DOCTYPE[\s\S]*?>/g, "")
        .replace(/\r?\n|\r/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Replace colors with currentColor if requested
      if (useCurrentColor) {
        cleanSvg = cleanSvg
          .replace(/stroke="(?!(none|transparent))[^"]*"/gi, 'stroke="currentColor"')
          .replace(/fill="(?!(none|transparent))[^"]*"/gi, 'fill="currentColor"');
      }

      // 2. CSS Background Data URI
      const encodedSvg = encodeURIComponent(cleanSvg)
        .replace(/'/g, "%27")
        .replace(/"/g, "%22");
      const cssUri = `background-image: url("data:image/svg+xml,${encodedSvg}");`;

      // 3. React JSX / TSX Converter
      let jsxBody = cleanSvg
        .replace(/stroke-width/g, "strokeWidth")
        .replace(/stroke-linecap/g, "strokeLinecap")
        .replace(/stroke-linejoin/g, "strokeLinejoin")
        .replace(/stroke-miterlimit/g, "strokeMiterlimit")
        .replace(/stroke-dasharray/g, "strokeDasharray")
        .replace(/stroke-dashoffset/g, "strokeDashoffset")
        .replace(/stroke-opacity/g, "strokeOpacity")
        .replace(/fill-rule/g, "fillRule")
        .replace(/fill-opacity/g, "fillOpacity")
        .replace(/clip-rule/g, "clipRule")
        .replace(/clip-path/g, "clipPath")
        .replace(/stop-color/g, "stopColor")
        .replace(/stop-opacity/g, "stopOpacity")
        .replace(/color-interpolation-filters/g, "colorInterpolationFilters")
        .replace(/class=/g, "className=");

      // Ensure props spreading
      if (!jsxBody.includes("{...props}")) {
        jsxBody = jsxBody.replace("<svg", "<svg {...props}");
      }

      const cName = componentName.trim() || "ClyraIcon";

      const tsx = `import * as React from "react";

export function ${cName}(props: React.SVGProps<SVGSVGElement>) {
  return (
    ${jsxBody}
  );
}

export default ${cName};`;

      const jsx = `import React from "react";

export function ${cName}(props) {
  return (
    ${jsxBody}
  );
}

export default ${cName};`;

      // 4. Vue 3 Component
      const vue = `<template>
  ${cleanSvg}
</template>

<script setup>
// ${cName} Vue 3 Component
</script>`;

      // 5. Svelte Component
      const svelte = `<script>
  export let size = 24;
  export let color = "currentColor";
</script>

${cleanSvg.replace(/width="[^"]*"/, 'width={size}').replace(/height="[^"]*"/, 'height={size}')}`;

      // 6. React Native SVG Component
      const nativeBody = jsxBody
        .replace(/<svg/g, "<Svg")
        .replace(/<\/svg>/g, "</Svg>")
        .replace(/<path/g, "<Path")
        .replace(/<\/path>/g, "</Path>")
        .replace(/<circle/g, "<Circle")
        .replace(/<\/circle>/g, "</Circle>")
        .replace(/<rect/g, "<Rect")
        .replace(/<\/rect>/g, "</Rect>")
        .replace(/<g/g, "<G")
        .replace(/<\/g>/g, "</G>");

      const native = `import React from "react";
import Svg, { Path, Circle, Rect, G, SvgProps } from "react-native-svg";

export function ${cName}(props: SvgProps) {
  return (
    ${nativeBody}
  );
}

export default ${cName};`;

      const isValid = cleanSvg.toLowerCase().includes("<svg") && cleanSvg.toLowerCase().includes("</svg>");

      return {
        isValid,
        minified: cleanSvg,
        cssUri,
        jsx,
        tsx,
        vue,
        svelte,
        native,
      };
    } catch {
      return {
        isValid: false,
        minified: "",
        cssUri: "",
        jsx: "",
        tsx: "",
        vue: "",
        svelte: "",
        native: "",
      };
    }
  }, [svgInput, componentName, useCurrentColor]);

  // Export as High-Res PNG (100% in-browser)
  const handleExportPng = () => {
    if (!converted.isValid) return;

    const img = new Image();
    const svgBlob = new Blob([converted.minified], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = exportPngSize;
      canvas.height = exportPngSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, exportPngSize, exportPngSize);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `${componentName.toLowerCase()}-${exportPngSize}px.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Gambar PNG (${exportPngSize}px) berhasil diunduh!`, "success");
    };
    img.src = url;
  };

  // Download Code File
  const handleDownloadCode = () => {
    const ext =
      activeOutputTab === "tsx"
        ? "tsx"
        : activeOutputTab === "jsx"
        ? "jsx"
        : activeOutputTab === "vue"
        ? "vue"
        : activeOutputTab === "svelte"
        ? "svelte"
        : activeOutputTab === "native"
        ? "native.tsx"
        : activeOutputTab === "cssUri"
        ? "css"
        : "svg";

    const content =
      activeOutputTab === "tsx"
        ? converted.tsx
        : activeOutputTab === "jsx"
        ? converted.jsx
        : activeOutputTab === "vue"
        ? converted.vue
        : activeOutputTab === "svelte"
        ? converted.svelte
        : activeOutputTab === "native"
        ? converted.native
        : activeOutputTab === "cssUri"
        ? converted.cssUri
        : converted.minified;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${componentName.toLowerCase()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`File .${ext} berhasil diunduh!`, "success");
  };

  // Output Tabs Data
  const OUTPUT_TABS: { id: OutputFormat; label: string; icon: any }[] = [
    { id: "tsx", label: "React TSX", icon: Code2 },
    { id: "jsx", label: "React JSX", icon: Code2 },
    { id: "vue", label: "Vue 3", icon: FileCode2 },
    { id: "svelte", label: "Svelte", icon: FileCode2 },
    { id: "native", label: "React Native", icon: Code2 },
    { id: "cssUri", label: "CSS Data URI", icon: Layers },
    { id: "minified", label: "Clean Minified SVG", icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-md">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">SVG to JSX, CSS Data URI &amp; Optimizer Studio</h2>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                React &amp; Vue Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Konversi SVG ke Komponen React (JSX/TSX), Vue 3, Svelte, React Native, CSS Background URI, dan Ekspor PNG HD.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File SVG</span>
          </button>
        </div>
      </div>

      {/* 2. INPUT & SETTINGS SECTION */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase font-mono">
              Input Kode SVG XML
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-400">Nama Komponen:</span>
              <input
                type="text"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="ClyraIcon"
                className="w-32 bg-[#08090d] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-indigo-500 outline-none"
              />
            </div>

            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none font-mono">
              <input
                type="checkbox"
                checked={useCurrentColor}
                onChange={(e) => setUseCurrentColor(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span>Gunakan `currentColor` (Tailwind Friendly)</span>
            </label>

            <button
              onClick={() => setSvgInput("")}
              className="p-1 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
              title="Hapus Input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <textarea
          rows={6}
          value={svgInput}
          onChange={(e) => setSvgInput(e.target.value)}
          placeholder="<svg ...>...</svg>"
          className="w-full bg-[#08090d] border border-slate-800 rounded-2xl p-4 text-slate-100 text-xs font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed shadow-inner"
        />
      </div>

      {/* 3. VISUAL RENDER & CONVERSION MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (4 COLS): LIVE VISUAL PREVIEW & PNG EXPORT */}
        <div className="lg:col-span-4 bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase font-mono">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Visual Preview</span>
              </div>

              {/* Background Theme Switcher for SVG */}
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: "dark", label: "Dark" },
                    { id: "checker", label: "Grid" },
                    { id: "white", label: "Light" },
                  ] as const
                ).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setPreviewBg(b.id)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer",
                      previewBg === b.id ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Canvas Box */}
            <div
              className={cn(
                "w-full h-52 rounded-2xl border flex items-center justify-center p-6 overflow-hidden transition-colors shadow-inner",
                previewBg === "dark"
                  ? "bg-[#08090d] border-slate-800"
                  : previewBg === "white"
                  ? "bg-white border-slate-300 text-black"
                  : "bg-[radial-gradient(#262c40_1px,transparent_1px)] [background-size:12px_12px] bg-[#0c0e18] border-slate-800"
              )}
            >
              {converted.isValid ? (
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-24 [&>svg]:h-24 drop-shadow"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(converted.minified) }}
                />
              ) : (
                <span className="text-xs text-slate-600 italic">SVG tidak valid</span>
              )}
            </div>

            <div className="text-[11px] font-mono text-center text-slate-500">
              {converted.isValid ? (
                <span className="text-emerald-400 font-semibold">SVG Valid • Siap Digunakan</span>
              ) : (
                <span className="text-red-400">Pastikan tag &lt;svg&gt; dan &lt;/svg&gt; lengkap</span>
              )}
            </div>
          </div>

          {/* Raster PNG Export Studio */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Ekspor ke Raster PNG:</span>
              <select
                value={exportPngSize}
                onChange={(e) => setExportPngSize(Number(e.target.value))}
                className="bg-[#08090d] border border-slate-800 rounded-lg px-2 py-0.5 text-xs text-white"
              >
                <option value={256}>256 × 256 px</option>
                <option value={512}>512 × 512 px (HD)</option>
                <option value={1024}>1024 × 1024 px (Ultra HD)</option>
                <option value={2048}>2048 × 2048 px (Print)</option>
              </select>
            </div>

            <button
              onClick={handleExportPng}
              disabled={!converted.isValid}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unduh PNG ({exportPngSize}px)</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (8 COLS): TABS & GENERATED COMPONENT CODES */}
        <div className="lg:col-span-8 bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Output Selector Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex flex-wrap items-center gap-1.5">
                {OUTPUT_TABS.map((t) => {
                  const Icon = t.icon;
                  const isSelected = activeOutputTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveOutputTab(t.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer",
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                          : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadCode}
                  disabled={!converted.isValid}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                  title="Unduh File Kode"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                </button>

                <button
                  onClick={() => {
                    const content =
                      activeOutputTab === "tsx"
                        ? converted.tsx
                        : activeOutputTab === "jsx"
                        ? converted.jsx
                        : activeOutputTab === "vue"
                        ? converted.vue
                        : activeOutputTab === "svelte"
                        ? converted.svelte
                        : activeOutputTab === "native"
                        ? converted.native
                        : activeOutputTab === "cssUri"
                        ? converted.cssUri
                        : converted.minified;
                    copyVal(content, activeOutputTab);
                  }}
                  disabled={!converted.isValid}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {copiedKey === activeOutputTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Output Viewer */}
            <div className="w-full min-h-[300px] max-h-[360px] bg-[#08090d] border border-slate-800 rounded-2xl p-4 text-slate-200 text-xs font-mono leading-relaxed overflow-y-auto select-all shadow-inner">
              {activeOutputTab === "tsx" ? (
                <pre className="text-indigo-300 whitespace-pre-wrap">{converted.tsx}</pre>
              ) : activeOutputTab === "jsx" ? (
                <pre className="text-indigo-300 whitespace-pre-wrap">{converted.jsx}</pre>
              ) : activeOutputTab === "vue" ? (
                <pre className="text-emerald-300 whitespace-pre-wrap">{converted.vue}</pre>
              ) : activeOutputTab === "svelte" ? (
                <pre className="text-orange-300 whitespace-pre-wrap">{converted.svelte}</pre>
              ) : activeOutputTab === "native" ? (
                <pre className="text-cyan-300 whitespace-pre-wrap">{converted.native}</pre>
              ) : activeOutputTab === "cssUri" ? (
                <div className="text-amber-300 break-all">{converted.cssUri}</div>
              ) : (
                <pre className="text-slate-300 whitespace-pre-wrap">{converted.minified}</pre>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>Client-side Sanitized &amp; Safe</span>
            <span className="text-indigo-400 font-bold uppercase">.{activeOutputTab}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

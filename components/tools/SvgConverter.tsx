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
  Eye 
} from "lucide-react";
import { sanitizeSvg } from "@/lib/security";

export default function SvgConverter() {
  const [svgInput, setSvgInput] = useState<string>(
`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
</svg>`
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSvgInput(content);
    };
    reader.readAsText(file);
  };

  // Convert SVG to React JSX, Data URI, Minified
  const converted = useMemo(() => {
    if (!svgInput.trim()) {
      return { jsx: "", dataUri: "", minified: "", isValid: false };
    }

    try {
      // 1. Minify SVG
      let cleanSvg = svgInput
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/\r?\n|\r/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // 2. CSS Data URI
      const encodedSvg = encodeURIComponent(cleanSvg)
        .replace(/'/g, "%27")
        .replace(/"/g, "%22");
      const dataUri = `background-image: url("data:image/svg+xml,${encodedSvg}");`;

      // 3. React JSX Converter
      // Convert kebab-case attributes to camelCase
      let jsxBody = cleanSvg
        .replace(/stroke-width/g, "strokeWidth")
        .replace(/stroke-linecap/g, "strokeLinecap")
        .replace(/stroke-linejoin/g, "strokeLinejoin")
        .replace(/stroke-miterlimit/g, "strokeMiterlimit")
        .replace(/fill-rule/g, "fillRule")
        .replace(/clip-rule/g, "clipRule")
        .replace(/clip-path/g, "clipPath")
        .replace(/stop-color/g, "stopColor")
        .replace(/stop-opacity/g, "stopOpacity")
        .replace(/class=/g, "className=");

      // Wrap in React Component
      const jsx = `import React from "react";

export function CustomIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    ${jsxBody.replace("<svg", "<svg {...props}")}
  );
}`;

      return {
        jsx,
        dataUri,
        minified: cleanSvg,
        isValid: cleanSvg.includes("<svg") && cleanSvg.includes("</svg>"),
      };
    } catch (err) {
      return { jsx: "", dataUri: "", minified: "", isValid: false };
    }
  }, [svgInput]);

  const copyVal = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white">Input Kode SVG atau Upload File</span>
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .svg</span>
            </button>
            <button
              onClick={() => setSvgInput("")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-slate-800 text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>

        <textarea
          rows={6}
          value={svgInput}
          onChange={(e) => setSvgInput(e.target.value)}
          placeholder="<svg ...>...</svg>"
          className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-4 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
        />
      </div>

      {/* Visual Preview & Outputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Visual Preview Box */}
        <div className="md:col-span-4 bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase font-mono">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Visual Render Preview</span>
          </div>

          <div className="w-full h-48 bg-[#08090d] rounded-xl border border-slate-800 flex items-center justify-center p-6 overflow-hidden">
            {converted.isValid ? (
              <div
                className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                dangerouslySetInnerHTML={{ __html: sanitizeSvg(svgInput) }}
              />
            ) : (
              <span className="text-xs text-slate-600 italic">SVG tidak valid</span>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-mono text-center">
            {converted.isValid ? "SVG Valid • Rendering Optimal" : "Periksa sintaks SVG"}
          </div>
        </div>

        {/* Formats Tabs/Outputs */}
        <div className="md:col-span-8 space-y-4">
          {/* React JSX Output */}
          <div className="bg-[#0e111a] border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-300">
                React / Next.js Component (JSX / TSX)
              </span>
              <button
                onClick={() => copyVal(converted.jsx, "jsx")}
                disabled={!converted.jsx}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition-all disabled:opacity-40"
              >
                {copiedKey === "jsx" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-[11px]">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="text-[11px]">Salin JSX</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-[#08090d] border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-36 select-all">
              <code>{converted.jsx || "// Menunggu SVG input..."}</code>
            </pre>
          </div>

          {/* CSS Data URI */}
          <div className="bg-[#0e111a] border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-300">
                CSS Background Data URI
              </span>
              <button
                onClick={() => copyVal(converted.dataUri, "dataUri")}
                disabled={!converted.dataUri}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition-all disabled:opacity-40"
              >
                {copiedKey === "dataUri" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-[11px]">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="text-[11px]">Salin CSS</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-[#08090d] border border-slate-800 rounded-lg text-xs font-mono text-slate-300 break-all max-h-24 overflow-y-auto select-all">
              {converted.dataUri || <span className="text-slate-600 italic">Menunggu input...</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

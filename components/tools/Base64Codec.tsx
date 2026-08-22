"use client";

import { useState, useMemo, useRef, useEffect, ChangeEvent } from "react";
import { 
  Binary, 
  Copy, 
  Check, 
  Trash2, 
  ArrowRightLeft, 
  AlertCircle, 
  FileCode, 
  Sparkles, 
  Upload, 
  Download, 
  Eye, 
  ShieldCheck, 
  KeyRound, 
  Hash, 
  Globe, 
  Code2, 
  FileText, 
  Layers, 
  Sliders, 
  Zap,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

export type CodecFormat = 
  | "base64" 
  | "base64url" 
  | "url" 
  | "html" 
  | "hex" 
  | "binary" 
  | "jwt" 
  | "rot13";

type CodecMode = "encode" | "decode";

// HTML Entities Helper
const escapeHtml = (str: string) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const unescapeHtml = (str: string) => {
  const doc = new DOMParser().parseFromString(str, "text/html");
  return doc.documentElement.textContent || "";
};

export default function Base64Codec() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [input, setInput] = useState<string>("Clyra — Personal Creative & Productivity Workspace 🚀");
  const [mode, setMode] = useState<CodecMode>("encode");
  const [format, setFormat] = useState<CodecFormat>("base64");
  const [urlMode, setUrlMode] = useState<"component" | "full">("component");
  const [hexDelimiter, setHexDelimiter] = useState<"space" | "none" | "0x">("space");
  const [rotStep, setRotStep] = useState<number>(13);
  const [isLineByLine, setIsLineByLine] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [previewMime, setPreviewMime] = useState<string | null>(null);

  // Auto-detect format from input
  const detectedFormat = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(trimmed)) return "JWT Token";
    if (/^data:[a-zA-Z0-9/+-]+;base64,/.test(trimmed)) return "Base64 Data URI";
    if (/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(trimmed) && trimmed.length % 4 === 0 && trimmed.length >= 8) return "Base64";
    if (/^([0-9a-fA-F]{2}[\s:]?)+$/.test(trimmed) && trimmed.length > 4) return "Hexadecimal";
    if (/^[01\s]{8,}$/.test(trimmed)) return "Binary (0/1)";
    if (trimmed.includes("%20") || trimmed.includes("%3A") || trimmed.includes("%2F")) return "URL Encoded";
    return null;
  }, [input]);

  // Main Codec Compute Engine
  const { result, error, jwtParts, isImageBase64 } = useMemo(() => {
    if (!input) {
      return { result: "", error: null, jwtParts: null, isImageBase64: false };
    }

    try {
      // 1. JWT INSPECTOR / DECODER
      if (format === "jwt") {
        const parts = input.trim().split(".");
        if (parts.length !== 3) {
          return {
            result: "",
            error: "Format JWT tidak valid. Token JWT harus memiliki 3 bagian yang dipisahkan titik (Header.Payload.Signature).",
            jwtParts: null,
            isImageBase64: false,
          };
        }

        const decodeBase64Url = (str: string) => {
          let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
          while (base64.length % 4) base64 += "=";
          return decodeURIComponent(
            Array.prototype.map
              .call(atob(base64), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
        };

        const headerJson = JSON.stringify(JSON.parse(decodeBase64Url(parts[0])), null, 2);
        const payloadJson = JSON.stringify(JSON.parse(decodeBase64Url(parts[1])), null, 2);
        const signature = parts[2];

        return {
          result: `// HEADER:\n${headerJson}\n\n// PAYLOAD:\n${payloadJson}\n\n// SIGNATURE:\n${signature}`,
          error: null,
          jwtParts: { header: headerJson, payload: payloadJson, signature },
          isImageBase64: false,
        };
      }

      // 2. LINE-BY-LINE PROCESSOR HELPER
      const processSingleString = (str: string): string => {
        if (format === "base64") {
          if (mode === "encode") {
            return btoa(
              encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
                String.fromCharCode(parseInt(p1, 16))
              )
            );
          } else {
            // Strip data uri prefix if present
            const clean = str.replace(/^data:[^;]+;base64,/, "").trim();
            return decodeURIComponent(
              Array.prototype.map
                .call(atob(clean), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            );
          }
        }

        if (format === "base64url") {
          if (mode === "encode") {
            const b64 = btoa(
              encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
                String.fromCharCode(parseInt(p1, 16))
              )
            );
            return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
          } else {
            let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
            while (b64.length % 4) b64 += "=";
            return decodeURIComponent(
              Array.prototype.map
                .call(atob(b64), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            );
          }
        }

        if (format === "url") {
          if (mode === "encode") {
            return urlMode === "component" ? encodeURIComponent(str) : encodeURI(str);
          } else {
            return decodeURIComponent(str);
          }
        }

        if (format === "html") {
          return mode === "encode" ? escapeHtml(str) : unescapeHtml(str);
        }

        if (format === "hex") {
          if (mode === "encode") {
            const bytes = new TextEncoder().encode(str);
            const hexArray = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0"));
            if (hexDelimiter === "space") return hexArray.join(" ");
            if (hexDelimiter === "0x") return hexArray.map((h) => `0x${h}`).join(", ");
            return hexArray.join("");
          } else {
            const cleanHex = str.replace(/0x|[\s,:]/g, "");
            const bytes = new Uint8Array(
              cleanHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
            );
            return new TextDecoder().decode(bytes);
          }
        }

        if (format === "binary") {
          if (mode === "encode") {
            return Array.from(new TextEncoder().encode(str))
              .map((b) => b.toString(2).padStart(8, "0"))
              .join(" ");
          } else {
            const clean = str.replace(/[^01]/g, "");
            const bytes = new Uint8Array(
              clean.match(/.{1,8}/g)?.map((bin) => parseInt(bin, 2)) || []
            );
            return new TextDecoder().decode(bytes);
          }
        }

        if (format === "rot13") {
          const shift = rotStep % 26;
          return str.replace(/[a-zA-Z]/g, (c) => {
            const base = c <= "Z" ? 65 : 97;
            const dir = mode === "encode" ? shift : 26 - shift;
            return String.fromCharCode(((c.charCodeAt(0) - base + dir) % 26) + base);
          });
        }

        return str;
      };

      let computedResult = "";
      if (isLineByLine) {
        computedResult = input
          .split("\n")
          .map((line) => processSingleString(line))
          .join("\n");
      } else {
        computedResult = processSingleString(input);
      }

      // Check if output or input is image base64 data uri for live visualizer
      const checkBase64Img =
        input.startsWith("data:image/") ||
        (mode === "encode" && format === "base64" && input.startsWith("<svg")) ||
        (mode === "decode" && format === "base64" && computedResult.startsWith("<svg"));

      return {
        result: computedResult,
        error: null,
        jwtParts: null,
        isImageBase64: checkBase64Img,
      };
    } catch (err: any) {
      return {
        result: "",
        error:
          mode === "decode"
            ? `Input tidak valid untuk didecode dengan format ${format.toUpperCase()}. Pastikan format string sudah benar.`
            : "Gagal memproses encoding.",
        jwtParts: null,
        isImageBase64: false,
      };
    }
  }, [input, mode, format, urlMode, hexDelimiter, rotStep, isLineByLine]);

  // Copy Result
  const handleCopy = async () => {
    if (!result || error) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      showToast("Hasil berhasil disalin ke clipboard!", "copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Gagal menyalin.", "error");
    }
  };

  // Swap Input and Output
  const handleSwap = () => {
    if (!result || error) return;
    setInput(result);
    setMode(mode === "encode" ? "decode" : "encode");
    showToast("Arah konversi ditukar!", "info");
  };

  // File Upload (Converts any file to Base64)
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setInput(dataUrl);
        setMode("decode");
        setFormat("base64");
        setPreviewMime(file.type);
        showToast(`File "${file.name}" berhasil dimuat sebagai Base64 Data URI!`, "success");
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download Decoded Output as File
  const handleDownloadDecodedFile = () => {
    if (!result) return;
    let mime = "text/plain";
    let ext = "txt";

    if (input.startsWith("data:")) {
      const match = input.match(/^data:([^;]+);base64,/);
      if (match) {
        mime = match[1];
        ext = mime.split("/")[1] || "bin";
      }
    }

    const blob = new Blob([result], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clyra-decoded-${Date.now().toString().slice(-4)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`File .${ext} berhasil diunduh!`, "success");
  };

  // Sample Loaders
  const loadSample = (type: "base64" | "jwt" | "url" | "hex") => {
    if (type === "base64") {
      setFormat("base64");
      setMode("encode");
      setInput("Selamat datang di Clyra — Professional Creative & Productivity Hub ⚡");
    } else if (type === "jwt") {
      setFormat("jwt");
      setMode("decode");
      setInput(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTkiLCJuYW1lIjoiQ2x5cmEgRGV2Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.4peff_20fNf4v_k0h8yGZt_1q8rD5a9yQ0f"
      );
    } else if (type === "url") {
      setFormat("url");
      setMode("encode");
      setInput("https://clyra.vercel.app/tools/base64-codec?category=developer tools&status=active#preview");
    } else {
      setFormat("hex");
      setMode("encode");
      setInput("CLYRA-OBSIDIAN-2026");
    }
  };

  const FORMATS_LIST: { id: CodecFormat; label: string; badge: string; desc: string }[] = [
    { id: "base64", label: "Base64", badge: "RFC 4648", desc: "Standar encoding string & data gambar." },
    { id: "base64url", label: "Base64URL", badge: "Safe URL", desc: "Base64 aman URL (- dan _ tanpa padding =)." },
    { id: "url", label: "URL Encode", badge: "URI / Params", desc: "Karakter aman untuk URL query parameters." },
    { id: "html", label: "HTML Entities", badge: "Web Security", desc: "Mengonversi simbol <, >, &, \" ke entitas HTML." },
    { id: "hex", label: "Hexadecimal", badge: "Base-16", desc: "Representasi biner 16 (0-9, A-F)." },
    { id: "binary", label: "Binary (0/1)", badge: "Bit Stream", desc: "Aliran bit biner 8-bit untuk setiap karakter." },
    { id: "jwt", label: "JWT Inspector", badge: "Auth Token", desc: "Dekode & periksa JSON Web Token secara aman." },
    { id: "rot13", label: "Rot13 / Caesar", badge: "Cipher", desc: "Sandi substitusi pergeseran alfabet." },
  ];

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER & PRO BADGE */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-md">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Base64, URL &amp; Multi-Codec Studio</h2>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                100% Client-Side
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Encode &amp; Decode Base64, URL, HTML Entities, Hex, Binary, JWT Token, dan File Data URI instan.
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
            title="Konversi sembarang file (gambar, dokumen, audio) ke Base64 Data URI"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>File ke Base64</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Sample preset buttons */}
          <button
            onClick={() => loadSample("base64")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono border border-slate-800 transition-colors cursor-pointer"
          >
            Base64
          </button>
          <button
            onClick={() => loadSample("jwt")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono border border-slate-800 transition-colors cursor-pointer"
          >
            JWT
          </button>
          <button
            onClick={() => loadSample("url")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono border border-slate-800 transition-colors cursor-pointer"
          >
            URL
          </button>
          <button
            onClick={() => loadSample("hex")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono border border-slate-800 transition-colors cursor-pointer"
          >
            Hex
          </button>
        </div>
      </div>

      {/* 2. MASTER FORMAT MATRIX BAR */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Pilih Format Codec:</span>
          </div>

          {/* Mode Selector (Encode vs Decode) */}
          <div className="flex items-center bg-[#08090d] p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setMode("encode")}
              className={cn(
                "px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer",
                mode === "encode"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              ENCODE (Koding)
            </button>
            <button
              onClick={() => setMode("decode")}
              className={cn(
                "px-4 py-1.5 rounded-xl font-bold transition-all cursor-pointer",
                mode === "decode"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              DECODE (Dekode)
            </button>
          </div>
        </div>

        {/* Format Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {FORMATS_LIST.map((fmt) => {
            const isSelected = format === fmt.id;
            return (
              <button
                key={fmt.id}
                onClick={() => setFormat(fmt.id)}
                className={cn(
                  "p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer",
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md"
                    : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">{fmt.label}</span>
                </div>
                <span className="text-[9px] text-slate-500 line-clamp-1">{fmt.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Format Specific Options Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {format === "url" && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">Mode URL:</span>
                <button
                  onClick={() => setUrlMode("component")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-mono text-[11px] border cursor-pointer",
                    urlMode === "component" ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                  )}
                >
                  encodeURIComponent (Kompilasi Param)
                </button>
                <button
                  onClick={() => setUrlMode("full")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-mono text-[11px] border cursor-pointer",
                    urlMode === "full" ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                  )}
                >
                  encodeURI (Full URL)
                </button>
              </div>
            )}

            {format === "hex" && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">Pemisah Hex:</span>
                {(["space", "none", "0x"] as const).map((dl) => (
                  <button
                    key={dl}
                    onClick={() => setHexDelimiter(dl)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-mono text-[11px] border cursor-pointer",
                      hexDelimiter === dl ? "bg-indigo-600 text-white border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                    )}
                  >
                    {dl === "space" ? "Spasi (FF 00)" : dl === "none" ? "Padat (FF00)" : "Prefiks (0xFF, 0x00)"}
                  </button>
                ))}
              </div>
            )}

            {format === "rot13" && (
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-slate-400">Langkah Pergeseran ({rotStep}):</span>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={rotStep}
                  onChange={(e) => setRotStep(Number(e.target.value))}
                  className="w-28 accent-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Line by line mode toggle */}
          <label className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer select-none font-mono text-[11px]">
            <input
              type="checkbox"
              checked={isLineByLine}
              onChange={(e) => setIsLineByLine(e.target.checked)}
              className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Proses Per-Baris (Line-by-Line Mode)</span>
          </label>
        </div>
      </div>

      {/* 3. DUAL WORKSPACE: INPUT & OUTPUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUT BOX */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase font-mono">
                  Input ({mode === "encode" ? "Teks Asli" : format.toUpperCase()})
                </span>
                {detectedFormat && (
                  <span className="px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-mono">
                    Deteksi: {detectedFormat}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSwap}
                  disabled={!result || !!error}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                  title="Tukar Input dengan Hasil"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tukar</span>
                </button>

                <button
                  onClick={() => setInput("")}
                  className="p-1 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
                  title="Hapus Input"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={14}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "Ketik atau tempel teks yang ingin di-encode..."
                  : `Tempel string ${format.toUpperCase()} yang ingin di-decode...`
              }
              className="w-full bg-[#08090d] border border-slate-800 rounded-2xl p-4 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed shadow-inner"
            />
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>Karakter: {input.length}</span>
            <span>Ukuran: {new Blob([input]).size} bytes</span>
          </div>
        </div>

        {/* OUTPUT BOX */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase font-mono">
                  Hasil ({mode === "encode" ? format.toUpperCase() : "Teks Asli"})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {mode === "decode" && (
                  <button
                    onClick={handleDownloadDecodedFile}
                    disabled={!result || !!error}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                    title="Unduh hasil dekode sebagai file"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Unduh File</span>
                  </button>
                )}

                <button
                  onClick={handleCopy}
                  disabled={!result || !!error}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Hasil</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error ? (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/60 flex items-start gap-2.5 text-red-300 text-xs animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Kesalahan Dekode:</span>
                  <p className="text-[11px] text-red-400 font-mono leading-relaxed">{error}</p>
                </div>
              </div>
            ) : format === "jwt" && jwtParts ? (
              /* JWT Visual Inspector Display */
              <div className="space-y-3 font-mono text-xs max-h-[340px] overflow-y-auto pr-1">
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/40 space-y-1">
                  <span className="text-[10px] text-red-400 uppercase font-bold">1. JWT HEADER (Algoritma &amp; Tipe)</span>
                  <pre className="text-red-300 text-[11px] whitespace-pre-wrap select-all">{jwtParts.header}</pre>
                </div>
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-1">
                  <span className="text-[10px] text-purple-400 uppercase font-bold">2. JWT PAYLOAD (Claims &amp; Data)</span>
                  <pre className="text-purple-300 text-[11px] whitespace-pre-wrap select-all">{jwtParts.payload}</pre>
                </div>
                <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/40 space-y-1">
                  <span className="text-[10px] text-sky-400 uppercase font-bold">3. JWT SIGNATURE</span>
                  <p className="text-sky-300 text-[11px] break-all select-all">{jwtParts.signature}</p>
                </div>
              </div>
            ) : (
              /* Standard Result Output Area */
              <div className="w-full min-h-[285px] max-h-[340px] bg-[#08090d] border border-slate-800 rounded-2xl p-4 text-slate-200 text-xs font-mono break-all select-all leading-relaxed overflow-y-auto shadow-inner">
                {result || (
                  <span className="text-slate-600 italic">
                    Hasil {mode === "encode" ? "encoding" : "decoding"} akan muncul secara realtime di sini...
                  </span>
                )}
              </div>
            )}

            {/* Visualizer for Base64 Images */}
            {input.startsWith("data:image/") && (
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Visualizer Gambar Data URI:</span>
                </div>
                <div className="h-36 bg-[#08090d] rounded-xl flex items-center justify-center border border-slate-800 p-2 overflow-hidden">
                  <img src={input} alt="Base64 Preview" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Multi-Format Codec Engine</span>
            </span>
            <span>Panjang: {result.length} karakter</span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Copy, Check, ArrowRightLeft, Binary, AlertCircle, FileCode } from "lucide-react";

type Mode = "encode" | "decode";
type FormatType = "base64" | "url" | "hex";

export default function Base64Codec() {
  const [input, setInput] = useState("Hello Clyra World! 🚀");
  const [mode, setMode] = useState<Mode>("encode");
  const [format, setFormat] = useState<FormatType>("base64");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => {
    setError(null);
    if (!input) return "";

    try {
      if (format === "base64") {
        if (mode === "encode") {
          // UTF-8 safe base64 encode
          return btoa(
            encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) =>
              String.fromCharCode(parseInt(p1, 16))
            )
          );
        } else {
          // UTF-8 safe base64 decode
          return decodeURIComponent(
            Array.prototype.map
              .call(atob(input.trim()), (c: string) => {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );
        }
      } else if (format === "url") {
        if (mode === "encode") {
          return encodeURIComponent(input);
        } else {
          return decodeURIComponent(input);
        }
      } else if (format === "hex") {
        if (mode === "encode") {
          return Array.from(new TextEncoder().encode(input))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" ");
        } else {
          const cleanHex = input.replace(/\s+/g, "");
          const bytes = new Uint8Array(
            cleanHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
          );
          return new TextDecoder().decode(bytes);
        }
      }
      return "";
    } catch (err: any) {
      setError(
        mode === "decode"
          ? "Input tidak valid untuk format ini. Pastikan teks yang didecode sesuai format."
          : "Gagal memproses teks."
      );
      return "";
    }
  }, [input, mode, format]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings bar */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Mode Toggle */}
        <div className="flex items-center bg-[#08090d] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setMode("encode")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === "encode"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === "decode"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Decode
          </button>
        </div>

        {/* Format Selectors */}
        <div className="flex items-center gap-2">
          {(["base64", "url", "hex"] as FormatType[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                format === fmt
                  ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/40"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs & Outputs side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase font-mono">
              <Binary className="w-3.5 h-3.5 text-indigo-400" />
              Input ({mode === "encode" ? "Plain Text" : format.toUpperCase()})
            </span>
            <button
              onClick={() => setInput("")}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Kosongkan
            </button>
          </div>

          <textarea
            rows={8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Masukkan teks biasa di sini..."
                : `Tempel string ${format.toUpperCase()} di sini...`
            }
            className="w-full bg-[#08090d] border border-slate-800 rounded-xl p-4 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

        {/* Output */}
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase font-mono">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                Hasil ({mode === "encode" ? format.toUpperCase() : "Plain Text"})
              </span>

              <button
                onClick={handleCopy}
                disabled={!result || !!error}
                className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-300" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Hasil</span>
                  </>
                )}
              </button>
            </div>

            {error ? (
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 flex items-start gap-2.5 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="w-full min-h-[190px] bg-[#08090d] border border-slate-800 rounded-xl p-4 text-slate-200 text-xs font-mono break-all select-all leading-relaxed overflow-y-auto max-h-60">
                {result || (
                  <span className="text-slate-600 italic">
                    Hasil {mode} akan muncul otomatis di sini...
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>Client-side Safe Processing</span>
            <span>Length: {result.length} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}

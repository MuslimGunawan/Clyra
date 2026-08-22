"use client";

import { useState, useRef, useEffect, ChangeEvent, useCallback } from "react";
import JSZip from "jszip";
import { 
  Upload, 
  RefreshCw, 
  Download, 
  Trash2, 
  FileImage, 
  ArrowRightLeft, 
  Check, 
  Sparkles, 
  Archive, 
  Layers, 
  Sliders, 
  ShieldCheck, 
  Maximize2, 
  Code2, 
  Copy, 
  Eye, 
  Palette,
  FileCode2,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

export type TargetFormat = "webp" | "png" | "jpeg" | "ico" | "bmp" | "pdf" | "base64";

interface FaviconSize {
  label: string;
  size: number;
}

const FAVICON_SIZES: FaviconSize[] = [
  { label: "16 × 16 (Browser Tab)", size: 16 },
  { label: "32 × 32 (Standard Favicon)", size: 32 },
  { label: "48 × 48 (Desktop Icon)", size: 48 },
  { label: "64 × 64 (High DPI)", size: 64 },
  { label: "128 × 128 (Web App)", size: 128 },
  { label: "180 × 180 (Apple Touch Icon)", size: 180 },
  { label: "256 × 256 (Windows Tile / Mac)", size: 256 },
];

interface ConvertedItem {
  id: string;
  file: File;
  name: string;
  originalUrl: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  convertedUrl: string | null;
  convertedBlob: Blob | null;
  convertedSize: number;
  convertedWidth: number;
  convertedHeight: number;
  base64Data?: string;
  status: "idle" | "converting" | "done" | "error";
}

export default function ImageConverter() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Batch Image Items
  const [items, setItems] = useState<ConvertedItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Conversion Settings
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("webp");
  const [quality, setQuality] = useState<number>(90);
  const [faviconSize, setFaviconSize] = useState<number>(64);
  const [bgColor, setBgColor] = useState<string>("#ffffff"); // for JPEG / BMP matte
  const [resizeOption, setResizeOption] = useState<"original" | "1920" | "1280" | "800" | "square">("original");

  // State
  const [isZipping, setIsZipping] = useState(false);
  const [copiedBase64, setCopiedBase64] = useState(false);

  const activeItem = items.find((i) => i.id === activeId) || items[0] || null;

  // Format File Size
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Convert Single Canvas Process
  const convertCanvas = useCallback(
    async (
      imgSrc: string,
      origW: number,
      origH: number,
      fmt: TargetFormat,
      q: number,
      favSize: number,
      bg: string,
      resize: "original" | "1920" | "1280" | "800" | "square"
    ): Promise<{ blob: Blob; url: string; width: number; height: number; base64Data?: string } | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = async () => {
          let naturalW = img.naturalWidth || origW || img.width;
          let naturalH = img.naturalHeight || origH || img.height;

          let targetW = naturalW;
          let targetH = naturalH;

          // Handle Resize
          if (fmt === "ico") {
            targetW = favSize;
            targetH = favSize;
          } else if (resize === "square") {
            const minDim = Math.min(naturalW, naturalH);
            targetW = minDim;
            targetH = minDim;
          } else if (resize === "1920" && naturalW > 1920) {
            targetW = 1920;
            targetH = Math.round((naturalH * 1920) / naturalW);
          } else if (resize === "1280" && naturalW > 1280) {
            targetW = 1280;
            targetH = Math.round((naturalH * 1280) / naturalW);
          } else if (resize === "800" && naturalW > 800) {
            targetW = 800;
            targetH = Math.round((naturalH * 800) / naturalW);
          }

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }

          // Fill Matte for non-transparent formats
          if (fmt === "jpeg" || fmt === "bmp") {
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, targetW, targetH);
          }

          if (resize === "square" && fmt !== "ico") {
            // Center crop square
            const sourceMin = Math.min(naturalW, naturalH);
            const sx = (naturalW - sourceMin) / 2;
            const sy = (naturalH - sourceMin) / 2;
            ctx.drawImage(img, sx, sy, sourceMin, sourceMin, 0, 0, targetW, targetH);
          } else {
            ctx.drawImage(img, 0, 0, targetW, targetH);
          }

          // Base64 output format
          if (fmt === "base64") {
            const dataUrl = canvas.toDataURL("image/png");
            const blob = new Blob([dataUrl], { type: "text/plain" });
            resolve({
              blob,
              url: dataUrl,
              width: targetW,
              height: targetH,
              base64Data: dataUrl,
            });
            return;
          }

          // MIME format resolver
          let mimeType = "image/webp";
          if (fmt === "png" || fmt === "ico") mimeType = "image/png";
          if (fmt === "jpeg") mimeType = "image/jpeg";
          if (fmt === "bmp") mimeType = "image/bmp";

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                resolve({ blob, url, width: targetW, height: targetH });
              } else {
                resolve(null);
              }
            },
            mimeType,
            fmt === "png" ? undefined : q / 100
          );
        };
        img.src = imgSrc;
      });
    },
    []
  );

  // Trigger Conversion for All Items Realtime
  const runConversionAll = useCallback(
    (
      currentItems: ConvertedItem[],
      fmt: TargetFormat,
      q: number,
      favSize: number,
      bg: string,
      resize: "original" | "1920" | "1280" | "800" | "square"
    ) => {
      if (currentItems.length === 0) return;

      Promise.all(
        currentItems.map(async (item) => {
          const res = await convertCanvas(
            item.originalUrl,
            item.originalWidth,
            item.originalHeight,
            fmt,
            q,
            favSize,
            bg,
            resize
          );

          if (res) {
            if (item.convertedUrl && fmt !== "base64") URL.revokeObjectURL(item.convertedUrl);
            return {
              ...item,
              convertedBlob: res.blob,
              convertedUrl: res.url,
              convertedSize: res.blob.size,
              convertedWidth: res.width,
              convertedHeight: res.height,
              base64Data: res.base64Data,
              status: "done" as const,
            };
          }
          return item;
        })
      ).then((updated) => {
        setItems(updated);
      });
    },
    [convertCanvas]
  );

  // Add Files
  const handleAddFiles = (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) return;

    const newItems: ConvertedItem[] = valid.map((file) => {
      const url = URL.createObjectURL(file);
      return {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        file,
        name: file.name,
        originalUrl: url,
        originalSize: file.size,
        originalWidth: 0,
        originalHeight: 0,
        convertedUrl: null,
        convertedBlob: null,
        convertedSize: 0,
        convertedWidth: 0,
        convertedHeight: 0,
        status: "converting",
      };
    });

    newItems.forEach((item) => {
      const img = new Image();
      img.onload = () => {
        item.originalWidth = img.naturalWidth || img.width;
        item.originalHeight = img.naturalHeight || img.height;
      };
      img.src = item.originalUrl;
    });

    const combined = [...items, ...newItems];
    setItems(combined);
    if (!activeId && newItems[0]) {
      setActiveId(newItems[0].id);
    }

    runConversionAll(combined, targetFormat, quality, faviconSize, bgColor, resizeOption);
  };

  // Clipboard Paste (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pasteItems = e.clipboardData?.items;
      if (!pasteItems) return;
      const files: File[] = [];
      for (let i = 0; i < pasteItems.length; i++) {
        if (pasteItems[i].type.startsWith("image/")) {
          const file = pasteItems[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        handleAddFiles(files);
        showToast(`${files.length} gambar ditempel dari clipboard!`, "success");
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [items, targetFormat, quality, faviconSize, bgColor, resizeOption, runConversionAll]);

  // Remove Single
  const handleRemove = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.convertedUrl && targetFormat !== "base64") URL.revokeObjectURL(item.convertedUrl);
    }
    const remaining = items.filter((i) => i.id !== id);
    setItems(remaining);
    if (activeId === id) {
      setActiveId(remaining[0]?.id || null);
    }
  };

  // Clear All
  const handleClearAll = () => {
    items.forEach((i) => {
      if (i.originalUrl) URL.revokeObjectURL(i.originalUrl);
      if (i.convertedUrl && targetFormat !== "base64") URL.revokeObjectURL(i.convertedUrl);
    });
    setItems([]);
    setActiveId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download Single File
  const handleDownloadSingle = (item: ConvertedItem) => {
    if (!item.convertedUrl && !item.base64Data) return;
    const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf(".")) || item.name;

    if (targetFormat === "base64") {
      navigator.clipboard.writeText(item.base64Data || "");
      showToast("String Data URI Base64 berhasil disalin ke clipboard!", "copied");
      return;
    }

    const ext = targetFormat === "jpeg" ? "jpg" : targetFormat;
    const a = document.createElement("a");
    a.href = item.convertedUrl!;
    a.download = `${nameWithoutExt}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`File .${ext.toUpperCase()} berhasil diunduh!`, "success");
  };

  // Download All as ZIP
  const handleDownloadAllZip = async () => {
    if (items.length === 0) return;
    setIsZipping(true);
    showToast("Mengemas semua file terkonversi ke ZIP...", "info");

    try {
      const zip = new JSZip();
      const ext = targetFormat === "jpeg" ? "jpg" : targetFormat;

      items.forEach((item, index) => {
        const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
        if (targetFormat === "base64" && item.base64Data) {
          zip.file(`${nameWithoutExt}-base64.txt`, item.base64Data);
        } else if (item.convertedBlob) {
          zip.file(`${nameWithoutExt}.${ext}`, item.convertedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clyra-converted-${targetFormat}-bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("File ZIP berhasil diunduh!", "success");
    } catch {
      showToast("Gagal membuat ZIP.", "error");
    } finally {
      setIsZipping(false);
    }
  };

  // Switch Format
  const handleFormatChange = (fmt: TargetFormat) => {
    setTargetFormat(fmt);
    runConversionAll(items, fmt, quality, faviconSize, bgColor, resizeOption);
  };

  // Target Format Options List
  const FORMAT_OPTIONS: { id: TargetFormat; label: string; badge: string; desc: string }[] = [
    { id: "webp", label: "WebP", badge: "Paling Ringan", desc: "Standar web modern dengan kompresi superior & transparansi." },
    { id: "png", label: "PNG", badge: "Lossless HD", desc: "Kualitas gambar tajam tanpa kehilangan piksel, mendukung alpha." },
    { id: "jpeg", label: "JPG / JPEG", badge: "Universal", desc: "Format foto standar dengan kompatibilitas universal di semua platform." },
    { id: "ico", label: "ICO Favicon", badge: "Icon Studio", desc: "Ikon tab browser (16px, 32px, 48px, 64px, 128px, 256px)." },
    { id: "bmp", label: "BMP", badge: "Bitmap Raw", desc: "Format bitmap Windows klasik tanpa kompresi." },
    { id: "base64", label: "Base64 URI", badge: "Web Embed", desc: "Konversi langsung ke string `data:image/...` untuk embed HTML/CSS." },
  ];

  return (
    <div className="space-y-8">
      {/* 1. UPLOAD BOX (When Empty) */}
      {items.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) handleAddFiles(Array.from(e.dataTransfer.files));
          }}
          className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-[#0e111a]/70 hover:bg-[#121524] rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 group shadow-2xl space-y-4"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) handleAddFiles(Array.from(e.target.files));
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all flex items-center justify-center shadow-lg">
            <ArrowRightLeft className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
              Pilih Gambar yang Ingin Dikonversi Formatnya (Batch Supported)
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Konversi PNG, JPG, WebP, SVG, AVIF, HEIC, BMP ke WebP, PNG, JPG, Favicon ICO, BMP, atau Base64.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-Side Safe</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800">
              <FileImage className="w-3.5 h-3.5 text-indigo-400" />
              <span>Favicon ICO Generator</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800">
              <Archive className="w-3.5 h-3.5 text-purple-400" />
              <span>Unduh Batch ZIP</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* 2. TOP ACTION & SUMMARY BAR */}
          <div className="bg-[#0c0e17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-white">
                  {items.length} Gambar Dimuat
                </span>
              </div>
              <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Target Format:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                  .{targetFormat}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) handleAddFiles(Array.from(e.target.files));
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tambah File</span>
              </button>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/50 text-slate-400 hover:text-red-300 text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan</span>
              </button>

              <button
                onClick={handleDownloadAllZip}
                disabled={isZipping || items.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                <span>{isZipping ? "Mengemas ZIP..." : `Unduh Semua ZIP (${items.length})`}</span>
              </button>
            </div>
          </div>

          {/* 3. MULTI-IMAGE CAROUSEL STRIP */}
          {items.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {items.map((item) => {
                const isSelected = item.id === activeItem?.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    className={cn(
                      "flex items-center gap-2.5 p-2 rounded-xl border bg-[#0a0c13] shrink-0 cursor-pointer transition-all select-none max-w-[220px]",
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50"
                        : "border-slate-800 hover:border-slate-700"
                    )}
                  >
                    <img
                      src={item.originalUrl}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-800"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono mt-0.5">
                        <span className="text-slate-400">{formatBytes(item.originalSize)}</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-indigo-400 font-bold uppercase">.{targetFormat}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. MASTER CONVERSION MATRIX SELECTOR */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pilih Format Target Output:</h3>
              </div>
              <p className="text-xs text-slate-400">Pilih format target yang ingin Anda hasilkan.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((opt) => {
                const isSelected = targetFormat === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleFormatChange(opt.id)}
                    className={cn(
                      "p-4 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer",
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white uppercase font-mono">{opt.label}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border",
                        isSelected ? "bg-indigo-500/30 text-indigo-200 border-indigo-400/40" : "bg-slate-800 text-slate-400 border-slate-700"
                      )}>
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Sub-Options: ICO Favicon Size or JPEG/BMP Background Matte */}
            {targetFormat === "ico" && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">Ukuran Favicon ICO:</span>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{faviconSize} × {faviconSize} px</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FAVICON_SIZES.map((fs) => (
                    <button
                      key={fs.size}
                      onClick={() => {
                        setFaviconSize(fs.size);
                        runConversionAll(items, targetFormat, quality, fs.size, bgColor, resizeOption);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-mono border transition-colors cursor-pointer",
                        faviconSize === fs.size
                          ? "bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                      )}
                    >
                      {fs.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(targetFormat === "jpeg" || targetFormat === "bmp") && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>Warna Latar Belakang (Matte untuk transparansi):</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => {
                        setBgColor(e.target.value);
                        runConversionAll(items, targetFormat, quality, faviconSize, e.target.value, resizeOption);
                      }}
                      className="w-7 h-7 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">{bgColor}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quality Slider (for WebP and JPEG) */}
            {(targetFormat === "webp" || targetFormat === "jpeg") && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">Tingkat Kualitas Output</span>
                  <span className="text-indigo-400 font-bold">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) => {
                    const q = Number(e.target.value);
                    setQuality(q);
                    runConversionAll(items, targetFormat, q, faviconSize, bgColor, resizeOption);
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            )}
          </div>

          {/* 5. LIVE PREVIEW & DOWNLOAD SINGLE */}
          {activeItem && (
            <div className="bg-[#0e111a] border border-slate-800/90 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-indigo-400" />
                    <span>{activeItem.name}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Asli: {activeItem.originalWidth} × {activeItem.originalHeight} px ({formatBytes(activeItem.originalSize)})
                    {" ➔ "}
                    <span className="text-emerald-400 font-bold">
                      Hasil: {activeItem.convertedWidth} × {activeItem.convertedHeight} px ({formatBytes(activeItem.convertedSize)})
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadSingle(activeItem)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  {targetFormat === "base64" ? (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin String Base64</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Unduh File (.{targetFormat.toUpperCase()})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview Display */}
              {targetFormat === "base64" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>String Data URI Base64:</span>
                    <span>{activeItem.base64Data?.length || 0} karakter</span>
                  </div>
                  <textarea
                    rows={6}
                    readOnly
                    value={activeItem.base64Data || ""}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-2xl p-4 text-slate-300 text-xs font-mono break-all focus:outline-none select-all"
                  />
                </div>
              ) : (
                <div className="relative w-full h-80 sm:h-96 bg-[#07090e] rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 p-4">
                  {activeItem.convertedUrl ? (
                    <img
                      src={activeItem.convertedUrl}
                      alt="Converted"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-indigo-400">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="text-xs font-mono">Mengonversi format...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

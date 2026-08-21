"use client";

import { useState, useRef, ChangeEvent, useCallback } from "react";
import { 
  Upload, 
  ImageDown, 
  Download, 
  Trash2, 
  Check, 
  RefreshCw, 
  Sliders, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  Gauge
} from "lucide-react";

type CompressionMode = "quality" | "targetSize";

export default function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState(false);

  // Compression Mode: 'quality' slider OR 'targetSize' (in KB)
  const [mode, setMode] = useState<CompressionMode>("quality");
  const [quality, setQuality] = useState<number>(80);
  const [targetKb, setTargetKb] = useState<number>(200); // 200 KB target
  const [maxWidth, setMaxWidth] = useState<number>(0); // 0 = original
  const [outputFormat, setOutputFormat] = useState<"image/webp" | "image/jpeg" | "image/png">("image/webp");

  const [achievedQuality, setAchievedQuality] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper promise to convert canvas to blob
  const canvasToBlobPromise = (
    canvas: HTMLCanvasElement,
    format: string,
    q: number
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), format, q);
    });
  };

  // Standard direct quality compression
  const compressDirect = useCallback(
    async (
      img: HTMLImageElement,
      q: number,
      maxW: number,
      fmt: "image/webp" | "image/jpeg" | "image/png"
    ) => {
      setIsCompressing(true);

      let targetWidth = img.width;
      let targetHeight = img.height;

      if (maxW > 0 && targetWidth > maxW) {
        targetHeight = Math.round((img.height * maxW) / img.width);
        targetWidth = maxW;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsCompressing(false);
        return;
      }

      if (fmt === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const blob = await canvasToBlobPromise(canvas, fmt, q / 100);
      if (blob) {
        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        const newUrl = URL.createObjectURL(blob);
        setCompressedUrl(newUrl);
        setCompressedSize(blob.size);
        setAchievedQuality(q);
      }
      setIsCompressing(false);
    },
    [compressedUrl]
  );

  // Binary Search Auto-compression to reach target KB
  const compressToTargetSize = useCallback(
    async (
      img: HTMLImageElement,
      targetBytes: number,
      maxW: number,
      fmt: "image/webp" | "image/jpeg" | "image/png"
    ) => {
      setIsCompressing(true);

      let targetWidth = img.width;
      let targetHeight = img.height;

      if (maxW > 0 && targetWidth > maxW) {
        targetHeight = Math.round((img.height * maxW) / img.width);
        targetWidth = maxW;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsCompressing(false);
        return;
      }

      if (fmt === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Binary search for optimal quality factor between 0.05 and 0.98
      let low = 0.05;
      let high = 0.98;
      let bestBlob: Blob | null = null;
      let bestQ = 0.8;

      for (let i = 0; i < 7; i++) {
        const mid = (low + high) / 2;
        const blob = await canvasToBlobPromise(canvas, fmt, mid);
        if (!blob) break;

        if (blob.size <= targetBytes) {
          bestBlob = blob;
          bestQ = mid;
          low = mid; // Try to get better quality while staying under target
        } else {
          high = mid; // Too large, reduce quality
        }
      }

      // If even lowest quality is too large, fallback to lowest quality or resize slightly
      if (!bestBlob) {
        bestBlob = await canvasToBlobPromise(canvas, fmt, 0.08);
        bestQ = 0.08;
      }

      if (bestBlob) {
        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        const newUrl = URL.createObjectURL(bestBlob);
        setCompressedUrl(newUrl);
        setCompressedSize(bestBlob.size);
        setAchievedQuality(Math.round(bestQ * 100));
      }

      setIsCompressing(false);
    },
    [compressedUrl]
  );

  const processCurrent = useCallback(
    (
      currentMode: CompressionMode,
      currentQuality: number,
      currentTargetKb: number,
      currentMaxW: number,
      currentFmt: "image/webp" | "image/jpeg" | "image/png"
    ) => {
      if (!originalUrl) return;
      const img = new Image();
      img.onload = () => {
        if (currentMode === "quality") {
          compressDirect(img, currentQuality, currentMaxW, currentFmt);
        } else {
          compressToTargetSize(img, currentTargetKb * 1024, currentMaxW, currentFmt);
        }
      };
      img.src = originalUrl;
    },
    [originalUrl, compressDirect, compressToTargetSize]
  );

  const loadAndCompress = (file: File) => {
    setOriginalFile(file);
    setOriginalSize(file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setOriginalUrl(src);

      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        if (mode === "quality") {
          compressDirect(img, quality, maxWidth, outputFormat);
        } else {
          compressToTargetSize(img, targetKb * 1024, maxWidth, outputFormat);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadAndCompress(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const percentageSaved =
    originalSize > 0 && compressedSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  const handleDownload = () => {
    if (!compressedUrl || !originalFile) return;
    const ext = outputFormat === "image/webp" ? "webp" : outputFormat === "image/jpeg" ? "jpg" : "png";
    const nameWithoutExt = originalFile.name.substring(0, originalFile.name.lastIndexOf(".")) || originalFile.name;
    const a = document.createElement("a");
    a.href = compressedUrl;
    a.download = `${nameWithoutExt}-compressed.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setOriginalFile(null);
    setOriginalUrl(null);
    setCompressedUrl(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setAchievedQuality(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      {!originalFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith("image/")) {
              loadAndCompress(file);
            }
          }}
          className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-[#0e111a]/70 hover:bg-[#121524] rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group shadow-xl"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/bmp"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all flex items-center justify-center mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
            Pilih atau Tarik File Gambar ke Sini
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Mendukung PNG, JPG, JPEG, WebP. Kompresi berjalan 100% di browser Anda tanpa upload ke server.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-white">Mode Kompresi:</span>

                {/* Mode Switch: Slider Quality vs Target KB */}
                <div className="flex items-center bg-[#08090d] p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => {
                      setMode("quality");
                      processCurrent("quality", quality, targetKb, maxWidth, outputFormat);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      mode === "quality"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Slider Kualitas</span>
                  </button>

                  <button
                    onClick={() => {
                      setMode("targetSize");
                      processCurrent("targetSize", quality, targetKb, maxWidth, outputFormat);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      mode === "targetSize"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Target Ukuran (KB)</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 text-xs transition-colors self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ganti Gambar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Quality Slider OR Target KB Box */}
              {mode === "quality" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Kualitas ({quality}%)</span>
                    <span className="text-indigo-400 font-mono font-semibold">
                      {quality > 85 ? "Tinggi" : quality > 60 ? "Seimbang" : "Ekonomis"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => {
                      const newQ = Number(e.target.value);
                      setQuality(newQ);
                      processCurrent("quality", newQ, targetKb, maxWidth, outputFormat);
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Tentukan Target Ukuran Maksimal</span>
                    <span className="text-indigo-400 font-mono font-bold">{targetKb} KB</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="20"
                      max="10000"
                      value={targetKb}
                      onChange={(e) => {
                        const newKb = Math.max(10, Number(e.target.value));
                        setTargetKb(newKb);
                        processCurrent("targetSize", quality, newKb, maxWidth, outputFormat);
                      }}
                      className="w-28 bg-[#08090d] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-xs text-slate-400 font-mono">KB</span>
                  </div>

                  {/* Preset quick chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[50, 100, 200, 500, 1024].map((kb) => (
                      <button
                        key={kb}
                        onClick={() => {
                          setTargetKb(kb);
                          processCurrent("targetSize", quality, kb, maxWidth, outputFormat);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                          targetKb === kb
                            ? "bg-indigo-600/30 text-indigo-300 border-indigo-500"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Format Selector */}
              <div className="space-y-2">
                <div className="text-xs text-slate-300 font-medium">Format Output</div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "image/webp", label: "WebP (Best)" },
                      { id: "image/jpeg", label: "JPG" },
                      { id: "image/png", label: "PNG" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setOutputFormat(f.id);
                        processCurrent(mode, quality, targetKb, maxWidth, f.id);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                        outputFormat === f.id
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Dimension */}
              <div className="space-y-2">
                <div className="text-xs text-slate-300 font-medium">Maksimal Lebar (Resize)</div>
                <select
                  value={maxWidth}
                  onChange={(e) => {
                    const newMaxW = Number(e.target.value);
                    setMaxWidth(newMaxW);
                    processCurrent(mode, quality, targetKb, newMaxW, outputFormat);
                  }}
                  className="w-full bg-[#08090d] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={0}>Ukuran Asli ({originalDimensions.width}px)</option>
                  <option value={1920}>Full HD (1920px)</option>
                  <option value={1280}>HD (1280px)</option>
                  <option value={800}>Medium (800px)</option>
                  <option value={500}>Small / Thumbnail (500px)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Preview */}
            <div className="bg-[#0e111a] border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase">
                  Gambar Asli
                </span>
                <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {formatFileSize(originalSize)}
                </span>
              </div>

              <div className="relative w-full h-64 bg-[#08090d] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                {originalUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                <span>Nama: {originalFile?.name}</span>
                <span>{originalDimensions.width} × {originalDimensions.height}px</span>
              </div>
            </div>

            {/* Compressed Preview */}
            <div className="bg-[#0e111a] border border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-emerald-400 uppercase">
                      Hasil Kompresi
                    </span>
                    {percentageSaved > 0 && (
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        -{percentageSaved}% Hemat
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 font-bold">
                    {formatFileSize(compressedSize)}
                  </span>
                </div>

                <div className="relative w-full h-64 bg-[#08090d] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                  {isCompressing ? (
                    <div className="flex flex-col items-center gap-2 text-indigo-400">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-mono">
                        {mode === "targetSize"
                          ? `Mengoptimalkan ke target ${targetKb} KB...`
                          : "Mengompres..."}
                      </span>
                    </div>
                  ) : compressedUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={compressedUrl}
                      alt="Compressed"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : null}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                {mode === "targetSize" && achievedQuality && (
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Target: {targetKb} KB</span>
                    <span className="text-emerald-400">Kualitas Auto-Adaptive: ~{achievedQuality}%</span>
                  </div>
                )}

                <button
                  onClick={handleDownload}
                  disabled={!compressedUrl || isCompressing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Gambar Terkompresi ({formatFileSize(compressedSize)})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

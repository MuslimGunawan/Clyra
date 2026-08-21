"use client";

import { useState, useRef, ChangeEvent } from "react";
import { 
  Upload, 
  RefreshCw, 
  Download, 
  Trash2, 
  FileImage, 
  ArrowRightLeft,
  Check
} from "lucide-react";

type SupportedFormat = "png" | "jpeg" | "webp" | "ico";

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>("webp");
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected, targetFormat);
  };

  const processFile = (f: File, fmt: SupportedFormat) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageUrl(src);
      performConversion(src, fmt);
    };
    reader.readAsDataURL(f);
  };

  const performConversion = (src: string, fmt: SupportedFormat) => {
    setIsConverting(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // For ICO, set default square dimensions e.g. 64x64 or 128x128
      if (fmt === "ico") {
        width = 64;
        height = 64;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsConverting(false);
        return;
      }

      if (fmt === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType =
        fmt === "png"
          ? "image/png"
          : fmt === "jpeg"
          ? "image/jpeg"
          : fmt === "webp"
          ? "image/webp"
          : "image/png"; // fallback for ico blob

      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (convertedUrl) URL.revokeObjectURL(convertedUrl);
            const url = URL.createObjectURL(blob);
            setConvertedUrl(url);
          }
          setIsConverting(false);
        },
        mimeType,
        0.95
      );
    };
    img.src = src;
  };

  const handleTargetFormatChange = (fmt: SupportedFormat) => {
    setTargetFormat(fmt);
    if (imageUrl) {
      performConversion(imageUrl, fmt);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl || !file) return;
    const nameWithoutExt =
      file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const a = document.createElement("a");
    a.href = convertedUrl;
    a.download = `${nameWithoutExt}.${targetFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setFile(null);
    setImageUrl(null);
    setConvertedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8">
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files?.[0];
            if (dropped && dropped.type.startsWith("image/")) {
              processFile(dropped, targetFormat);
            }
          }}
          className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-[#0e111a]/70 hover:bg-[#121524] rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group shadow-xl"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
            Pilih File Gambar yang Ingin Dikonversi
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Mendukung PNG, JPG, WebP, BMP, SVG, TIFF ke format PNG, JPG, WebP, atau Favicon ICO.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Format selection */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">Format Target:</span>
              <div className="flex items-center gap-2">
                {(["webp", "png", "jpeg", "ico"] as SupportedFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleTargetFormatChange(fmt)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      targetFormat === fmt
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 text-xs transition-colors self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ganti File</span>
            </button>
          </div>

          {/* Preview & Download */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="text-sm font-semibold text-white">Pratinjau Hasil Konversi</div>
                <div className="text-xs text-slate-400 font-mono">
                  {file.name} ➔ .{targetFormat}
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={!convertedUrl || isConverting}
                className="flex items-center gap-2 py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Hasil ({targetFormat.toUpperCase()})</span>
              </button>
            </div>

            <div className="relative w-full h-80 bg-[#08090d] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
              {isConverting ? (
                <div className="flex flex-col items-center gap-2 text-indigo-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-mono">Mengonversi format...</span>
                </div>
              ) : convertedUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={convertedUrl}
                  alt="Converted"
                  className="max-w-full max-h-full object-contain"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, ChangeEvent, useCallback } from "react";
import JSZip from "jszip";
import { 
  Upload, 
  Download, 
  Trash2, 
  Sliders, 
  Sparkles, 
  Gauge, 
  Target, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  SunMedium, 
  Contrast, 
  Eye, 
  Split, 
  Layers, 
  Archive, 
  FileCheck2, 
  Check, 
  RefreshCw, 
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  Lock,
  Unlock,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

type CompressionMode = "quality" | "targetSize";
type OutputFormat = "image/webp" | "image/jpeg" | "image/png";
type PreviewMode = "split" | "sideBySide" | "single";

interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalUrl: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  compressedUrl: string | null;
  compressedBlob: Blob | null;
  compressedSize: number;
  compressedWidth: number;
  compressedHeight: number;
  achievedQuality?: number;
  status: "idle" | "processing" | "done" | "error";
}

export default function ImageCompressor() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Batch Image List
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Global Optimization Settings
  const [mode, setMode] = useState<CompressionMode>("quality");
  const [quality, setQuality] = useState<number>(80);
  const [targetKb, setTargetKb] = useState<number>(200);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/webp");
  
  // Resizing settings
  const [resizeMode, setResizeMode] = useState<"original" | "preset" | "percentage" | "custom">("original");
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [percentage, setPercentage] = useState<number>(100);
  const [customWidth, setCustomWidth] = useState<number>(1280);
  const [customHeight, setCustomHeight] = useState<number>(720);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);

  // Filters & Adjustments
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [isGrayscale, setIsGrayscale] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100); // 100 = normal
  const [contrast, setContrast] = useState<number>(100); // 100 = normal

  // View state
  const [previewMode, setPreviewMode] = useState<PreviewMode>("split");
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Active selected image for preview
  const currentImage = images.find((img) => img.id === selectedImageId) || images[0] || null;

  // Listen to Global Paste (Ctrl+V) for screenshots
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        addFiles(files);
        showToast(`${files.length} gambar ditempel dari clipboard!`, "success");
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [images]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.originalUrl) URL.revokeObjectURL(img.originalUrl);
        if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
      });
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const canvasToBlobPromise = (
    canvas: HTMLCanvasElement,
    format: string,
    q: number
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), format, q);
    });
  };

  // Process a single image through Canvas
  const processImageFile = async (
    item: ImageItem,
    overrideSettings?: Partial<{
      mode: CompressionMode;
      quality: number;
      targetKb: number;
      outputFormat: OutputFormat;
      rotation: number;
      flipH: boolean;
      flipV: boolean;
      isGrayscale: boolean;
      brightness: number;
      contrast: number;
      resizeMode: "original" | "preset" | "percentage" | "custom";
      maxWidth: number;
      percentage: number;
      customWidth: number;
      customHeight: number;
    }>
  ): Promise<{ blob: Blob; url: string; width: number; height: number; qualityAchieved?: number } | null> => {
    const sMode = overrideSettings?.mode ?? mode;
    const sQuality = overrideSettings?.quality ?? quality;
    const sTargetKb = overrideSettings?.targetKb ?? targetKb;
    const sFormat = overrideSettings?.outputFormat ?? outputFormat;
    const sRotation = overrideSettings?.rotation ?? rotation;
    const sFlipH = overrideSettings?.flipH ?? flipH;
    const sFlipV = overrideSettings?.flipV ?? flipV;
    const sGrayscale = overrideSettings?.isGrayscale ?? isGrayscale;
    const sBrightness = overrideSettings?.brightness ?? brightness;
    const sContrast = overrideSettings?.contrast ?? contrast;
    const sResizeMode = overrideSettings?.resizeMode ?? resizeMode;
    const sMaxWidth = overrideSettings?.maxWidth ?? maxWidth;
    const sPercentage = overrideSettings?.percentage ?? percentage;
    const sCustomWidth = overrideSettings?.customWidth ?? customWidth;
    const sCustomHeight = overrideSettings?.customHeight ?? customHeight;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = async () => {
        let origW = img.naturalWidth || img.width;
        let origH = img.naturalHeight || img.height;

        // Calculate Target Dimensions
        let targetW = origW;
        let targetH = origH;

        if (sResizeMode === "preset" && sMaxWidth > 0 && origW > sMaxWidth) {
          targetW = sMaxWidth;
          targetH = Math.round((origH * sMaxWidth) / origW);
        } else if (sResizeMode === "percentage" && sPercentage < 100 && sPercentage > 0) {
          targetW = Math.max(1, Math.round((origW * sPercentage) / 100));
          targetH = Math.max(1, Math.round((origH * sPercentage) / 100));
        } else if (sResizeMode === "custom") {
          targetW = Math.max(1, sCustomWidth);
          targetH = Math.max(1, sCustomHeight);
        }

        // Handle Canvas Rotation Dimensions
        const isRotated90 = sRotation === 90 || sRotation === 270;
        const canvasW = isRotated90 ? targetH : targetW;
        const canvasH = isRotated90 ? targetW : targetH;

        const canvas = document.createElement("canvas");
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        // Fill background for JPEG
        if (sFormat === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvasW, canvasH);
        }

        // Apply visual CSS filters (Grayscale, Brightness, Contrast)
        const filterParts: string[] = [];
        if (sGrayscale) filterParts.push("grayscale(100%)");
        if (sBrightness !== 100) filterParts.push(`brightness(${sBrightness}%)`);
        if (sContrast !== 100) filterParts.push(`contrast(${sContrast}%)`);
        if (filterParts.length > 0) {
          ctx.filter = filterParts.join(" ");
        }

        // Apply Transformations (Rotate, Flip)
        ctx.save();
        ctx.translate(canvasW / 2, canvasH / 2);
        if (sRotation !== 0) {
          ctx.rotate((sRotation * Math.PI) / 180);
        }
        ctx.scale(sFlipH ? -1 : 1, sFlipV ? -1 : 1);
        ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
        ctx.restore();

        // Compress
        if (sMode === "quality") {
          const blob = await canvasToBlobPromise(canvas, sFormat, sQuality / 100);
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve({ blob, url, width: canvasW, height: canvasH, qualityAchieved: sQuality });
          } else {
            resolve(null);
          }
        } else {
          // Binary Search Target KB
          const targetBytes = sTargetKb * 1024;
          let low = 0.05;
          let high = 0.98;
          let bestBlob: Blob | null = null;
          let bestQ = 0.8;

          for (let i = 0; i < 7; i++) {
            const mid = (low + high) / 2;
            const b = await canvasToBlobPromise(canvas, sFormat, mid);
            if (!b) break;
            if (b.size <= targetBytes) {
              bestBlob = b;
              bestQ = mid;
              low = mid;
            } else {
              high = mid;
            }
          }

          if (!bestBlob) {
            bestBlob = await canvasToBlobPromise(canvas, sFormat, 0.05);
            bestQ = 0.05;
          }

          if (bestBlob) {
            const url = URL.createObjectURL(bestBlob);
            resolve({
              blob: bestBlob,
              url,
              width: canvasW,
              height: canvasH,
              qualityAchieved: Math.round(bestQ * 100),
            });
          } else {
            resolve(null);
          }
        }
      };
      img.src = item.originalUrl;
    });
  };

  // Re-process all images when settings change
  const triggerRecompressAll = useCallback(
    async (itemsToProcess?: ImageItem[]) => {
      const targetList = itemsToProcess || images;
      if (targetList.length === 0) return;

      setIsBatchProcessing(true);

      const updated = await Promise.all(
        targetList.map(async (item) => {
          const result = await processImageFile(item);
          if (result) {
            if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
            return {
              ...item,
              compressedBlob: result.blob,
              compressedUrl: result.url,
              compressedSize: result.blob.size,
              compressedWidth: result.width,
              compressedHeight: result.height,
              achievedQuality: result.qualityAchieved,
              status: "done" as const,
            };
          }
          return item;
        })
      );

      setImages(updated);
      setIsBatchProcessing(false);
    },
    [
      images,
      mode,
      quality,
      targetKb,
      outputFormat,
      resizeMode,
      maxWidth,
      percentage,
      customWidth,
      customHeight,
      rotation,
      flipH,
      flipV,
      isGrayscale,
      brightness,
      contrast,
    ]
  );

  const addFiles = (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) return;

    const newItems: ImageItem[] = valid.map((file) => {
      const url = URL.createObjectURL(file);
      return {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        file,
        name: file.name,
        originalUrl: url,
        originalSize: file.size,
        originalWidth: 0,
        originalHeight: 0,
        compressedUrl: null,
        compressedBlob: null,
        compressedSize: 0,
        compressedWidth: 0,
        compressedHeight: 0,
        status: "processing",
      };
    });

    // Populate natural dimensions and immediately compress
    newItems.forEach((item) => {
      const img = new Image();
      img.onload = () => {
        item.originalWidth = img.naturalWidth || img.width;
        item.originalHeight = img.naturalHeight || img.height;
        if (customWidth === 1280 && item.originalWidth > 0) {
          setCustomWidth(item.originalWidth);
          setCustomHeight(item.originalHeight);
        }
      };
      img.src = item.originalUrl;
    });

    const combined = [...images, ...newItems];
    setImages(combined);
    if (!selectedImageId && newItems[0]) {
      setSelectedImageId(newItems[0].id);
    }

    // Process new items
    triggerRecompressAll(combined);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    addFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => {
    const item = images.find((i) => i.id === id);
    if (item) {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    }
    const remaining = images.filter((i) => i.id !== id);
    setImages(remaining);
    if (selectedImageId === id) {
      setSelectedImageId(remaining[0]?.id || null);
    }
  };

  const clearAllImages = () => {
    images.forEach((i) => {
      if (i.originalUrl) URL.revokeObjectURL(i.originalUrl);
      if (i.compressedUrl) URL.revokeObjectURL(i.compressedUrl);
    });
    setImages([]);
    setSelectedImageId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download single image
  const downloadSingle = (item: ImageItem) => {
    if (!item.compressedUrl) return;
    const ext = outputFormat === "image/webp" ? "webp" : outputFormat === "image/jpeg" ? "jpg" : "png";
    const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
    const a = document.createElement("a");
    a.href = item.compressedUrl;
    a.download = `${nameWithoutExt}-clyra.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download all as ZIP
  const downloadAllAsZip = async () => {
    if (images.length === 0) return;
    setIsZipping(true);
    showToast("Mengemas semua file terkompresi ke ZIP...", "info");

    try {
      const zip = new JSZip();
      const ext = outputFormat === "image/webp" ? "webp" : outputFormat === "image/jpeg" ? "jpg" : "png";

      images.forEach((item, index) => {
        if (item.compressedBlob) {
          const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
          zip.file(`${nameWithoutExt}-clyra-${index + 1}.${ext}`, item.compressedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clyra-compressed-batch-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("File ZIP berhasil diunduh!", "success");
    } catch (err) {
      showToast("Gagal membuat file ZIP.", "error");
    } finally {
      setIsZipping(false);
    }
  };

  // Quick preset apply
  const applyPreset = (pName: "webMax" | "balanced" | "eco" | "lossless") => {
    if (pName === "webMax") {
      setMode("quality");
      setQuality(88);
      setOutputFormat("image/webp");
      setResizeMode("preset");
      setMaxWidth(1920);
    } else if (pName === "balanced") {
      setMode("quality");
      setQuality(75);
      setOutputFormat("image/webp");
      setResizeMode("preset");
      setMaxWidth(1440);
    } else if (pName === "eco") {
      setMode("quality");
      setQuality(55);
      setOutputFormat("image/webp");
      setResizeMode("preset");
      setMaxWidth(1080);
    } else if (pName === "lossless") {
      setMode("quality");
      setQuality(95);
      setOutputFormat("image/png");
      setResizeMode("original");
    }
    setTimeout(() => triggerRecompressAll(), 50);
  };

  // Split view dragging handler
  const handleSplitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSplit || !splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSplitPos(percent);
  };

  const handleSplitTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!splitContainerRef.current || !e.touches[0]) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSplitPos(percent);
  };

  // Calculate Aggregates
  const totalOriginalBytes = images.reduce((acc, i) => acc + i.originalSize, 0);
  const totalCompressedBytes = images.reduce((acc, i) => acc + (i.compressedSize || i.originalSize), 0);
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalCompressedBytes);
  const totalSavedPercent =
    totalOriginalBytes > 0 ? Math.round((totalSavedBytes / totalOriginalBytes) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Upload Zone (When Empty OR Floating Bar when items exist) */}
      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
          }}
          className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-[#0e111a]/70 hover:bg-[#121524] rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 group shadow-2xl space-y-4"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png, image/jpeg, image/webp, image/bmp, image/avif"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all flex items-center justify-center shadow-lg">
            <Upload className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
              Pilih atau Tarik File Gambar ke Sini (Bisa Banyak / Batch)
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Mendukung PNG, JPG, JPEG, WebP, AVIF. Anda juga bisa langsung menempel screenshot dengan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px] border border-slate-700">Ctrl + V</kbd>.
            </p>
          </div>

          {/* Quick Features Highlight */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-Side Safe</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Ukuran KB Presisi</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800">
              <Archive className="w-3.5 h-3.5 text-purple-400" />
              <span>Unduh Batch ZIP 1-Klik</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Summary & Batch Action Bar */}
          <div className="bg-[#0c0e17] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-white">
                  {images.length} Gambar Dimuat
                </span>
              </div>
              <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">Asli: {formatFileSize(totalOriginalBytes)}</span>
                <span className="text-slate-600">→</span>
                <span className="text-emerald-400 font-bold">Hasil: {formatFileSize(totalCompressedBytes)}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  -{totalSavedPercent}% (-{formatFileSize(totalSavedBytes)})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp, image/bmp, image/avif"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tambah Gambar</span>
              </button>

              <button
                onClick={clearAllImages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/50 text-slate-400 hover:text-red-300 text-xs transition-colors"
                title="Hapus semua gambar"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan</span>
              </button>

              <button
                onClick={downloadAllAsZip}
                disabled={isZipping || images.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-40"
              >
                <Archive className="w-4 h-4" />
                <span>{isZipping ? "Mengemas ZIP..." : `Unduh Semua ZIP (${images.length})`}</span>
              </button>
            </div>
          </div>

          {/* Batch Thumbnails Carousel Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((item) => {
                const isSelected = item.id === currentImage?.id;
                const saved =
                  item.originalSize > 0 && item.compressedSize > 0
                    ? Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100)
                    : 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedImageId(item.id)}
                    className={cn(
                      "flex items-center gap-2.5 p-2 rounded-xl border bg-[#0a0c13] shrink-0 cursor-pointer transition-all select-none max-w-[220px]",
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-500/10"
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
                        <span className="text-emerald-400 font-bold">{formatFileSize(item.compressedSize)}</span>
                        {saved > 0 && (
                          <span className="text-emerald-500">(-{saved}%)</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(item.id);
                      }}
                      className="p-1 text-slate-500 hover:text-red-400"
                      title="Hapus gambar ini"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Master Controls & Adjustment Engine */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Quick Presets Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Profil Cepat:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applyPreset("webMax")}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 hover:border-indigo-500/40 transition-all"
                >
                  🚀 Web Maksimal (88%)
                </button>
                <button
                  onClick={() => applyPreset("balanced")}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 hover:border-indigo-500/40 transition-all"
                >
                  ⚖️ Seimbang (75%)
                </button>
                <button
                  onClick={() => applyPreset("eco")}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 hover:border-indigo-500/40 transition-all"
                >
                  🌱 Hemat Ekstrem (55%)
                </button>
                <button
                  onClick={() => applyPreset("lossless")}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 hover:border-indigo-500/40 transition-all"
                >
                  💎 PNG HD
                </button>
              </div>
            </div>

            {/* Core Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Mode & Compression Level */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Mode Kompresi</span>
                  </span>
                  <div className="flex items-center bg-[#08090d] p-0.5 rounded-lg border border-slate-800 text-[11px]">
                    <button
                      onClick={() => {
                        setMode("quality");
                        setTimeout(() => triggerRecompressAll(), 10);
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-all",
                        mode === "quality" ? "bg-indigo-600 text-white font-bold" : "text-slate-400"
                      )}
                    >
                      Kualitas
                    </button>
                    <button
                      onClick={() => {
                        setMode("targetSize");
                        setTimeout(() => triggerRecompressAll(), 10);
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-md transition-all",
                        mode === "targetSize" ? "bg-indigo-600 text-white font-bold" : "text-slate-400"
                      )}
                    >
                      Target KB
                    </button>
                  </div>
                </div>

                {mode === "quality" ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Kualitas Gambar</span>
                      <span className="text-indigo-400 font-bold">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={quality}
                      onChange={(e) => {
                        setQuality(Number(e.target.value));
                        triggerRecompressAll();
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Target Maksimal</span>
                      <span className="text-indigo-400 font-bold">{targetKb} KB</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        value={targetKb}
                        onChange={(e) => {
                          setTargetKb(Math.max(5, Number(e.target.value)));
                          triggerRecompressAll();
                        }}
                        className="w-full bg-[#08090d] border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:border-indigo-500 outline-none"
                      />
                      <span className="text-xs text-slate-500 font-mono">KB</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[50, 100, 200, 500, 1024].map((kb) => (
                        <button
                          key={kb}
                          onClick={() => {
                            setTargetKb(kb);
                            triggerRecompressAll();
                          }}
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-mono border transition-colors",
                            targetKb === kb
                              ? "bg-indigo-600/30 text-indigo-300 border-indigo-500"
                              : "bg-slate-900 text-slate-400 border-slate-800"
                          )}
                        >
                          {kb >= 1024 ? `${kb / 1024}MB` : `${kb}KB`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Format & Dimension Scaling */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Format &amp; Resolusi</span>
                </span>

                <div className="grid grid-cols-3 gap-1.5 bg-[#08090d] p-1 rounded-xl border border-slate-800 text-xs">
                  {(
                    [
                      { id: "image/webp", label: "WebP" },
                      { id: "image/jpeg", label: "JPG" },
                      { id: "image/png", label: "PNG" },
                    ] as const
                  ).map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => {
                        setOutputFormat(fmt.id);
                        triggerRecompressAll();
                      }}
                      className={cn(
                        "py-1.5 rounded-lg font-semibold transition-all text-center",
                        outputFormat === fmt.id
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>

                {/* Resize Selection */}
                <select
                  value={resizeMode}
                  onChange={(e) => {
                    setResizeMode(e.target.value as any);
                    triggerRecompressAll();
                  }}
                  className="w-full bg-[#08090d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                >
                  <option value="original">Resolusi Asli (100%)</option>
                  <option value="preset">Preset Max Lebar (1920 / 1280 / 800)</option>
                  <option value="percentage">Skala Persentase (75%, 50%, 25%)</option>
                  <option value="custom">Kustom Lebar × Tinggi</option>
                </select>

                {resizeMode === "preset" && (
                  <div className="flex gap-1.5">
                    {[1920, 1280, 800, 500].map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          setMaxWidth(w);
                          triggerRecompressAll();
                        }}
                        className={cn(
                          "flex-1 py-1 rounded-lg text-[10px] font-mono border",
                          maxWidth === w
                            ? "bg-indigo-600/30 text-indigo-300 border-indigo-500"
                            : "bg-slate-900 text-slate-400 border-slate-800"
                        )}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                )}

                {resizeMode === "percentage" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={percentage}
                      onChange={(e) => {
                        setPercentage(Number(e.target.value));
                        triggerRecompressAll();
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="text-xs font-mono text-indigo-400 w-10 text-right">{percentage}%</span>
                  </div>
                )}

                {resizeMode === "custom" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => {
                        const w = Number(e.target.value);
                        setCustomWidth(w);
                        if (keepAspectRatio && currentImage?.originalWidth) {
                          setCustomHeight(Math.round((w * currentImage.originalHeight) / currentImage.originalWidth));
                        }
                        triggerRecompressAll();
                      }}
                      className="w-20 bg-[#08090d] border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-white"
                      placeholder="W"
                    />
                    <span className="text-slate-500 text-xs">×</span>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => {
                        const h = Number(e.target.value);
                        setCustomHeight(h);
                        triggerRecompressAll();
                      }}
                      className="w-20 bg-[#08090d] border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-white"
                      placeholder="H"
                    />
                    <button
                      onClick={() => setKeepAspectRatio(!keepAspectRatio)}
                      className={cn(
                        "p-1.5 rounded-lg border",
                        keepAspectRatio ? "bg-indigo-600/30 text-indigo-300 border-indigo-500" : "bg-slate-900 text-slate-500 border-slate-800"
                      )}
                      title="Kunci Aspek Rasio"
                    >
                      {keepAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Visual Adjustments & Filters */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Transformasi &amp; Filter</span>
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setRotation((prev) => (prev + 90) % 360);
                      triggerRecompressAll();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs"
                    title="Putar 90 Derajat"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{rotation}°</span>
                  </button>

                  <button
                    onClick={() => {
                      setFlipH(!flipH);
                      triggerRecompressAll();
                    }}
                    className={cn(
                      "p-1.5 rounded-xl border transition-colors",
                      flipH ? "bg-indigo-600/30 text-indigo-300 border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                    )}
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setFlipV(!flipV);
                      triggerRecompressAll();
                    }}
                    className={cn(
                      "p-1.5 rounded-xl border transition-colors",
                      flipV ? "bg-indigo-600/30 text-indigo-300 border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                    )}
                    title="Flip Vertical"
                  >
                    <FlipVertical className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setIsGrayscale(!isGrayscale);
                      triggerRecompressAll();
                    }}
                    className={cn(
                      "px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors",
                      isGrayscale ? "bg-indigo-600/30 text-indigo-300 border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                    )}
                    title="Ubah ke Hitam Putih (Grayscale)"
                  >
                    B&amp;W
                  </button>
                </div>

                {/* Brightness & Contrast Sliders */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <SunMedium className="w-3 h-3 text-amber-400" /> Kecerahan
                    </span>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => {
                      setBrightness(Number(e.target.value));
                      triggerRecompressAll();
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PREVIEW & COMPARISON AREA */}
          {currentImage && (
            <div className="space-y-4">
              {/* Preview Mode Selector Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-white">{currentImage.name}</span>
                  <span>•</span>
                  <span>{currentImage.originalWidth} × {currentImage.originalHeight}px</span>
                </div>

                <div className="flex items-center bg-[#0e111a] p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setPreviewMode("split")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors",
                      previewMode === "split" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Split Slider</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode("sideBySide")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors",
                      previewMode === "sideBySide" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Berdampingan</span>
                  </button>
                </div>
              </div>

              {/* 1. Interactive Split Slider Mode */}
              {previewMode === "split" ? (
                <div
                  ref={splitContainerRef}
                  onMouseMove={handleSplitMouseMove}
                  onTouchMove={handleSplitTouchMove}
                  onMouseDown={() => setIsDraggingSplit(true)}
                  onMouseUp={() => setIsDraggingSplit(false)}
                  onTouchStart={() => setIsDraggingSplit(true)}
                  onTouchEnd={() => setIsDraggingSplit(false)}
                  className="relative w-full h-80 sm:h-96 md:h-[460px] bg-[#07090e] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none cursor-ew-resize"
                >
                  {/* Left Layer: Original Image */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img
                      src={currentImage.originalUrl}
                      alt="Original"
                      className="max-w-full max-h-full object-contain"
                    />
                    <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-slate-700">
                      Asli: {formatFileSize(currentImage.originalSize)}
                    </div>
                  </div>

                  {/* Right Layer: Compressed Image (Clipped by splitPos) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
                    style={{ clipPath: `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)` }}
                  >
                    {currentImage.compressedUrl && (
                      <img
                        src={currentImage.compressedUrl}
                        alt="Compressed"
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-emerald-950/80 backdrop-blur-md text-[11px] font-mono text-emerald-300 border border-emerald-700 font-bold">
                      Hasil: {formatFileSize(currentImage.compressedSize)} (-
                      {currentImage.originalSize > 0
                        ? Math.round(((currentImage.originalSize - currentImage.compressedSize) / currentImage.originalSize) * 100)
                        : 0}
                      %)
                    </div>
                  </div>

                  {/* Draggable Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none"
                    style={{ left: `${splitPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
                      <Split className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ) : (
                /* 2. Side by Side Mode */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0c0e17] border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">GAMBAR ASLI</span>
                      <span className="text-slate-300 font-bold">{formatFileSize(currentImage.originalSize)}</span>
                    </div>
                    <div className="relative w-full h-72 bg-[#07090e] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                      <img
                        src={currentImage.originalUrl}
                        alt="Original"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="bg-[#0c0e17] border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold">HASIL TERKOMPRESI</span>
                      <span className="text-emerald-300 font-bold">{formatFileSize(currentImage.compressedSize)}</span>
                    </div>
                    <div className="relative w-full h-72 bg-[#07090e] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                      {currentImage.compressedUrl && (
                        <img
                          src={currentImage.compressedUrl}
                          alt="Compressed"
                          className="max-w-full max-h-full object-contain"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Single Image Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c0e17] border border-slate-800">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">{currentImage.compressedWidth} × {currentImage.compressedHeight}px</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-indigo-400 font-semibold uppercase">{outputFormat.replace("image/", "")}</span>
                  {currentImage.achievedQuality && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400 font-bold">Quality: ~{currentImage.achievedQuality}%</span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => downloadSingle(currentImage)}
                  disabled={!currentImage.compressedUrl}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Gambar Ini ({formatFileSize(currentImage.compressedSize)})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

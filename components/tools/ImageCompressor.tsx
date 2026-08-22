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
  Split, 
  Layers, 
  Archive, 
  ImageIcon, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Maximize2,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";

type CompressionMode = "quality" | "targetSize";
type OutputFormat = "image/webp" | "image/jpeg" | "image/png";
type PreviewMode = "split" | "sideBySide";

interface SettingsState {
  mode: CompressionMode;
  quality: number;
  targetKb: number;
  outputFormat: OutputFormat;
  resizeMode: "original" | "preset" | "percentage" | "custom";
  maxWidth: number;
  percentage: number;
  customWidth: number;
  customHeight: number;
  keepAspectRatio: boolean;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  isGrayscale: boolean;
  brightness: number;
  contrast: number;
}

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
  isProcessing?: boolean;
}

export default function ImageCompressor() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Images state
  const [images, setImages] = useState<ImageItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Master Settings State
  const [settings, setSettings] = useState<SettingsState>({
    mode: "quality",
    quality: 80,
    targetKb: 100,
    outputFormat: "image/webp", // WebP is the superior default
    resizeMode: "original",
    maxWidth: 1920,
    percentage: 100,
    customWidth: 1920,
    customHeight: 1080,
    keepAspectRatio: true,
    rotation: 0,
    flipH: false,
    flipV: false,
    isGrayscale: false,
    brightness: 100,
    contrast: 100,
  });

  // UI Tabs & Views
  const [activeTab, setActiveTab] = useState<"compression" | "resize" | "filters">("compression");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("split");
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const activeImage = images.find((img) => img.id === activeId) || images[0] || null;

  // Format File Size
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Convert Canvas to Blob
  const canvasToBlobPromise = (
    canvas: HTMLCanvasElement,
    format: string,
    q: number
  ): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), format, q);
    });
  };

  // Ultra-Fast Canvas Processing Engine with Multi-Pass Target KB Optimizer
  const processImageCanvas = useCallback(
    async (
      imgSrc: string,
      origW: number,
      origH: number,
      st: SettingsState
    ): Promise<{ blob: Blob; url: string; width: number; height: number; qualityAchieved?: number } | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = async () => {
          let naturalW = img.naturalWidth || origW || img.width;
          let naturalH = img.naturalHeight || origH || img.height;

          // 1. Calculate Target Dimensions
          let targetW = naturalW;
          let targetH = naturalH;

          if (st.resizeMode === "preset" && st.maxWidth > 0 && naturalW > st.maxWidth) {
            targetW = st.maxWidth;
            targetH = Math.round((naturalH * st.maxWidth) / naturalW);
          } else if (st.resizeMode === "percentage" && st.percentage < 100 && st.percentage > 0) {
            targetW = Math.max(1, Math.round((naturalW * st.percentage) / 100));
            targetH = Math.max(1, Math.round((naturalH * st.percentage) / 100));
          } else if (st.resizeMode === "custom") {
            targetW = Math.max(1, st.customWidth);
            targetH = Math.max(1, st.customHeight);
          }

          // 2. Handle Rotation
          const isRotated90 = st.rotation === 90 || st.rotation === 270;
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

          // 3. Fill JPEG Background with White
          if (st.outputFormat === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvasW, canvasH);
          }

          // 4. Visual Filters
          const filters: string[] = [];
          if (st.isGrayscale) filters.push("grayscale(100%)");
          if (st.brightness !== 100) filters.push(`brightness(${st.brightness}%)`);
          if (st.contrast !== 100) filters.push(`contrast(${st.contrast}%)`);
          if (filters.length > 0) ctx.filter = filters.join(" ");

          // 5. Draw Transformations
          ctx.save();
          ctx.translate(canvasW / 2, canvasH / 2);
          if (st.rotation !== 0) ctx.rotate((st.rotation * Math.PI) / 180);
          ctx.scale(st.flipH ? -1 : 1, st.flipV ? -1 : 1);
          ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
          ctx.restore();

          // 6. Compression Execution
          if (st.mode === "quality") {
            const blob = await canvasToBlobPromise(canvas, st.outputFormat, st.quality / 100);
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({ blob, url, width: canvasW, height: canvasH, qualityAchieved: st.quality });
            } else {
              resolve(null);
            }
          } else {
            // Target KB Multi-Pass Engine (Adaptive Binary Search + Auto Downscale if needed)
            const targetBytes = st.targetKb * 1024;
            let bestBlob: Blob | null = null;
            let bestQ = 0.8;
            let finalW = canvasW;
            let finalH = canvasH;

            // Step A: Binary search quality (for WebP and JPEG)
            if (st.outputFormat !== "image/png") {
              let low = 0.05;
              let high = 0.98;

              for (let i = 0; i < 8; i++) {
                const mid = (low + high) / 2;
                const b = await canvasToBlobPromise(canvas, st.outputFormat, mid);
                if (!b) break;
                if (b.size <= targetBytes) {
                  bestBlob = b;
                  bestQ = mid;
                  low = mid; // Try higher quality while staying under target
                } else {
                  high = mid; // Too large, reduce quality
                }
              }
            }

            // Step B: If still larger than target (or PNG which is lossless and ignores quality parameter)
            // Progressively downscale dimensions to guarantee fitting under target KB!
            if (!bestBlob || bestBlob.size > targetBytes) {
              const scaleFactors = [0.9, 0.75, 0.6, 0.45, 0.35, 0.25, 0.15];
              for (const factor of scaleFactors) {
                const scaledW = Math.max(16, Math.round(canvasW * factor));
                const scaledH = Math.max(16, Math.round(canvasH * factor));
                const scCanvas = document.createElement("canvas");
                scCanvas.width = scaledW;
                scCanvas.height = scaledH;
                const scCtx = scCanvas.getContext("2d");
                if (!scCtx) continue;

                if (st.outputFormat === "image/jpeg") {
                  scCtx.fillStyle = "#ffffff";
                  scCtx.fillRect(0, 0, scaledW, scaledH);
                }
                scCtx.drawImage(canvas, 0, 0, scaledW, scaledH);

                const qToTest = st.outputFormat === "image/png" ? 1 : 0.7;
                const b = await canvasToBlobPromise(scCanvas, st.outputFormat, qToTest);
                if (b && b.size <= targetBytes) {
                  bestBlob = b;
                  finalW = scaledW;
                  finalH = scaledH;
                  bestQ = qToTest;
                  break;
                }
              }
            }

            // Fallback lowest possible if still over target
            if (!bestBlob) {
              bestBlob = await canvasToBlobPromise(canvas, st.outputFormat, 0.05);
              bestQ = 0.05;
            }

            if (bestBlob) {
              const url = URL.createObjectURL(bestBlob);
              resolve({
                blob: bestBlob,
                url,
                width: finalW,
                height: finalH,
                qualityAchieved: Math.round(bestQ * 100),
              });
            } else {
              resolve(null);
            }
          }
        };
        img.src = imgSrc;
      });
    },
    []
  );

  // Real-time Update Handler: Updates Active Image Instantly (<15ms)
  const applySettingsRealtime = useCallback(
    (newSettings: SettingsState, currentImagesList?: ImageItem[]) => {
      const list = currentImagesList || images;
      if (list.length === 0) return;

      const currentActive = list.find((i) => i.id === activeId) || list[0];
      if (!currentActive) return;

      // 1. Process active image immediately for zero-lag feedback
      processImageCanvas(
        currentActive.originalUrl,
        currentActive.originalWidth,
        currentActive.originalHeight,
        newSettings
      ).then((res) => {
        if (res) {
          setImages((prev) =>
            prev.map((item) => {
              if (item.id === currentActive.id) {
                if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
                return {
                  ...item,
                  compressedBlob: res.blob,
                  compressedUrl: res.url,
                  compressedSize: res.blob.size,
                  compressedWidth: res.width,
                  compressedHeight: res.height,
                  achievedQuality: res.qualityAchieved,
                  isProcessing: false,
                };
              }
              return item;
            })
          );
        }
      });

      // 2. Debounce batch processing for remaining background images (300ms)
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const otherImages = list.filter((i) => i.id !== currentActive.id);
        if (otherImages.length > 0) {
          Promise.all(
            otherImages.map(async (item) => {
              const res = await processImageCanvas(
                item.originalUrl,
                item.originalWidth,
                item.originalHeight,
                newSettings
              );
              if (res) {
                if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
                return {
                  ...item,
                  compressedBlob: res.blob,
                  compressedUrl: res.url,
                  compressedSize: res.blob.size,
                  compressedWidth: res.width,
                  compressedHeight: res.height,
                  achievedQuality: res.qualityAchieved,
                };
              }
              return item;
            })
          ).then((updatedOthers) => {
            setImages((prev) =>
              prev.map((item) => {
                const found = updatedOthers.find((o) => o.id === item.id);
                return found || item;
              })
            );
          });
        }
      }, 300);
    },
    [activeId, images, processImageCanvas]
  );

  // Helper to update a setting and trigger instant real-time compression
  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    let updated = { ...settings, [key]: value };

    // Smart UX: If user selects Target Size mode and current format is PNG, automatically suggest WebP
    if (key === "mode" && value === "targetSize" && settings.outputFormat === "image/png") {
      updated.outputFormat = "image/webp";
    }

    setSettings(updated);
    applySettingsRealtime(updated);
  };

  // Add Files Handler
  const handleAddFiles = (files: File[]) => {
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
        isProcessing: true,
      };
    });

    // Extract natural dimensions
    newItems.forEach((item) => {
      const img = new Image();
      img.onload = () => {
        item.originalWidth = img.naturalWidth || img.width;
        item.originalHeight = img.naturalHeight || img.height;
      };
      img.src = item.originalUrl;
    });

    const combined = [...images, ...newItems];
    setImages(combined);
    if (!activeId && newItems[0]) {
      setActiveId(newItems[0].id);
    }

    applySettingsRealtime(settings, combined);
  };

  // Clipboard Paste Listener (Ctrl+V)
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
        handleAddFiles(files);
        showToast(`${files.length} gambar ditempel dari clipboard!`, "success");
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [images, settings, applySettingsRealtime]);

  // Remove Single Image
  const handleRemoveImage = (id: string) => {
    const item = images.find((i) => i.id === id);
    if (item) {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    }
    const remaining = images.filter((i) => i.id !== id);
    setImages(remaining);
    if (activeId === id) {
      setActiveId(remaining[0]?.id || null);
    }
  };

  // Clear All
  const handleClearAll = () => {
    images.forEach((i) => {
      if (i.originalUrl) URL.revokeObjectURL(i.originalUrl);
      if (i.compressedUrl) URL.revokeObjectURL(i.compressedUrl);
    });
    setImages([]);
    setActiveId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download Single
  const handleDownloadSingle = (item: ImageItem) => {
    if (!item.compressedUrl) return;
    const ext = settings.outputFormat === "image/webp" ? "webp" : settings.outputFormat === "image/jpeg" ? "jpg" : "png";
    const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
    const a = document.createElement("a");
    a.href = item.compressedUrl;
    a.download = `${nameWithoutExt}-clyra.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Gambar berhasil diunduh!", "success");
  };

  // Download All as ZIP
  const handleDownloadZip = async () => {
    if (images.length === 0) return;
    setIsZipping(true);
    showToast("Mengemas file ke ZIP...", "info");

    try {
      const zip = new JSZip();
      const ext = settings.outputFormat === "image/webp" ? "webp" : settings.outputFormat === "image/jpeg" ? "jpg" : "png";

      images.forEach((item, index) => {
        if (item.compressedBlob) {
          const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
          zip.file(`${nameWithoutExt}-compressed-${index + 1}.${ext}`, item.compressedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clyra-images-bundle-${Date.now().toString().slice(-4)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("ZIP berhasil diunduh!", "success");
    } catch {
      showToast("Gagal membuat ZIP.", "error");
    } finally {
      setIsZipping(false);
    }
  };

  // Preset Shortcuts
  const applyPreset = (preset: "web" | "doc" | "hd" | "max") => {
    let nextSt: SettingsState;
    if (preset === "web") {
      nextSt = { ...settings, mode: "quality", quality: 80, outputFormat: "image/webp", resizeMode: "preset", maxWidth: 1920 };
    } else if (preset === "doc") {
      nextSt = { ...settings, mode: "targetSize", targetKb: 100, outputFormat: "image/webp", resizeMode: "original" };
    } else if (preset === "hd") {
      nextSt = { ...settings, mode: "quality", quality: 92, outputFormat: "image/png", resizeMode: "original" };
    } else {
      nextSt = { ...settings, mode: "quality", quality: 50, outputFormat: "image/webp", resizeMode: "percentage", percentage: 75 };
    }
    setSettings(nextSt);
    applySettingsRealtime(nextSt);
    showToast("Preset diterapkan!", "info");
  };

  // Split-Slider Drag Handlers
  const handleSplitMove = (clientX: number) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSplitPos(percent);
  };

  // Aggregate Stats
  const totalOrig = images.reduce((acc, i) => acc + i.originalSize, 0);
  const totalComp = images.reduce((acc, i) => acc + (i.compressedSize || i.originalSize), 0);
  const isEnlarged = totalComp > totalOrig && totalOrig > 0;
  const savedBytes = Math.max(0, totalOrig - totalComp);
  const savedPercent = totalOrig > 0 && !isEnlarged ? Math.round((savedBytes / totalOrig) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* 1. UPLOAD BOX (When No Images) */}
      {images.length === 0 ? (
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
            accept="image/png, image/jpeg, image/webp, image/bmp, image/avif"
            onChange={(e) => {
              if (e.target.files) handleAddFiles(Array.from(e.target.files));
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all flex items-center justify-center shadow-lg">
            <Upload className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
              Pilih atau Tarik Gambar ke Sini (Bisa Banyak / Batch)
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Mendukung PNG, JPG, JPEG, WebP, AVIF. Atau langsung tempel screenshot dengan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px] border border-slate-700">Ctrl + V</kbd>.
            </p>
          </div>

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
        <div className="space-y-6 animate-fadeIn">
          {/* 2. TOP SUMMARY & BATCH BAR */}
          <div className="bg-[#0c0e17] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-white">
                  {images.length} Gambar Dimuat
                </span>
              </div>
              <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">Asli: {formatBytes(totalOrig)}</span>
                <span className="text-slate-600">→</span>
                <span className={cn("font-bold", isEnlarged ? "text-amber-400" : "text-emerald-400")}>
                  Hasil: {formatBytes(totalComp)}
                </span>
                {!isEnlarged ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    -{savedPercent}% (Hemat {formatBytes(savedBytes)})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    +Format PNG Raw
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp, image/bmp, image/avif"
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
                <Upload className="w-3.5 h-3.5" />
                <span>Tambah Gambar</span>
              </button>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/50 text-slate-400 hover:text-red-300 text-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan</span>
              </button>

              <button
                onClick={handleDownloadZip}
                disabled={isZipping || images.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                <span>{isZipping ? "Mengemas ZIP..." : `Unduh Semua ZIP (${images.length})`}</span>
              </button>
            </div>
          </div>

          {/* 3. MULTI-IMAGE CAROUSEL STRIP */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((item) => {
                const isSelected = item.id === activeImage?.id;
                const saved =
                  item.originalSize > 0 && item.compressedSize > 0
                    ? Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100)
                    : 0;

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
                        <span className="text-emerald-400 font-bold">{formatBytes(item.compressedSize)}</span>
                        {saved > 0 && (
                          <span className="text-emerald-500">(-{saved}%)</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(item.id);
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

          {/* PNG WARNING ALERT BANNER (If file enlarged due to lossless PNG) */}
          {activeImage && activeImage.compressedSize > activeImage.originalSize && settings.outputFormat === "image/png" && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-200 block mb-0.5">
                    Kenapa ukuran gambar bertambah menjadi {formatBytes(activeImage.compressedSize)}?
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Format <strong>PNG adalah format grafis lossless</strong> tanpa kompresi byte lossy. Jika mengonversi foto JPG ke PNG, ukuran akan membesar. Untuk mengompres ukuran file secara drastis, disarankan menggunakan format <strong>WebP</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSetting("outputFormat", "image/webp")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>Beralih ke WebP (Paling Hemat)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 4. MASTER SETTINGS PANEL (CLEAR TABS) */}
          <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
            {/* Presets Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Preset Cepat:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applyPreset("web")}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer"
                >
                  🚀 Siap Web (WebP 80%)
                </button>
                <button
                  onClick={() => applyPreset("doc")}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer"
                >
                  📄 Syarat Berkas (&lt; 100 KB)
                </button>
                <button
                  onClick={() => applyPreset("hd")}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer"
                >
                  💎 Tajam HD (PNG)
                </button>
                <button
                  onClick={() => applyPreset("max")}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer"
                >
                  🌱 Hemat Maksimal (50%)
                </button>
              </div>
            </div>

            {/* Sub-Tabs: 1. Kompresi | 2. Resolusi | 3. Filter Visual */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab("compression")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  activeTab === "compression"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-white bg-slate-900/60"
                )}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>1. Mode Kompresi &amp; Format</span>
              </button>

              <button
                onClick={() => setActiveTab("resize")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  activeTab === "resize"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-white bg-slate-900/60"
                )}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>2. Ubah Ukuran (Resize)</span>
              </button>

              <button
                onClick={() => setActiveTab("filters")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                  activeTab === "filters"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-white bg-slate-900/60"
                )}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>3. Putar &amp; Filter Visual</span>
              </button>
            </div>

            {/* TAB CONTENT 1: COMPRESSION & FORMAT */}
            {activeTab === "compression" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                {/* Engine Mode */}
                <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Metode Kompresi:</span>
                    <div className="flex items-center bg-[#08090d] p-0.5 rounded-lg border border-slate-800 text-xs">
                      <button
                        onClick={() => updateSetting("mode", "quality")}
                        className={cn(
                          "px-3 py-1 rounded-md transition-all cursor-pointer",
                          settings.mode === "quality" ? "bg-indigo-600 text-white font-bold" : "text-slate-400"
                        )}
                      >
                        Slider Kualitas (%)
                      </button>
                      <button
                        onClick={() => updateSetting("mode", "targetSize")}
                        className={cn(
                          "px-3 py-1 rounded-md transition-all cursor-pointer",
                          settings.mode === "targetSize" ? "bg-indigo-600 text-white font-bold" : "text-slate-400"
                        )}
                      >
                        Target Ukuran (KB)
                      </button>
                    </div>
                  </div>

                  {settings.mode === "quality" ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Tingkat Kualitas Gambar</span>
                        <span className="text-indigo-400 font-bold text-sm">{settings.quality}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={settings.quality}
                        onChange={(e) => updateSetting("quality", Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <p className="text-[11px] text-slate-500">
                        Geser ke kiri untuk file lebih ringan, atau ke kanan untuk detail gambar lebih tajam.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Batas Maksimal Ukuran File</span>
                        <span className="text-indigo-400 font-bold text-sm">{settings.targetKb} KB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="5"
                          max="10000"
                          value={settings.targetKb}
                          onChange={(e) => updateSetting("targetKb", Math.max(1, Number(e.target.value)))}
                          className="w-full bg-[#08090d] border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 outline-none"
                        />
                        <span className="text-xs text-slate-400 font-mono">KB</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[10, 20, 50, 100, 200, 500, 1024].map((kb) => (
                          <button
                            key={kb}
                            onClick={() => updateSetting("targetKb", kb)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors cursor-pointer",
                              settings.targetKb === kb
                                ? "bg-indigo-600 text-white border-indigo-500 font-bold"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                            )}
                          >
                            {kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Algoritma otomatis menyesuaikan kualitas dan resolusi agar pas di bawah batas target KB Anda.
                      </p>
                    </div>
                  )}
                </div>

                {/* Output Format */}
                <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div>
                    <span className="text-xs font-bold text-white block mb-1">Format Gambar Output:</span>
                    <p className="text-[11px] text-slate-400">Pilih format kompresi yang diinginkan.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "image/webp", name: "WebP", desc: "Paling Ringan (Disarankan)" },
                        { id: "image/jpeg", name: "JPG / JPEG", desc: "Standar Foto Universal" },
                        { id: "image/png", name: "PNG", desc: "Lossless (Ukuran Lebih Besar)" },
                      ] as const
                    ).map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => updateSetting("outputFormat", fmt.id)}
                        className={cn(
                          "p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer",
                          settings.outputFormat === fmt.id
                            ? "bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50"
                            : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
                        )}
                      >
                        <span className="text-xs font-bold">{fmt.name}</span>
                        <span className="text-[10px] text-slate-500 leading-tight">{fmt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: RESIZE */}
            {activeTab === "resize" && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white block">Pilihan Skala Resolusi:</span>
                    <p className="text-[11px] text-slate-400">
                      Dimensi Asli: {activeImage?.originalWidth || 0} × {activeImage?.originalHeight || 0} px
                    </p>
                  </div>

                  <select
                    value={settings.resizeMode}
                    onChange={(e) => updateSetting("resizeMode", e.target.value as any)}
                    className="bg-[#08090d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="original">Resolusi Asli (100%)</option>
                    <option value="preset">Preset Max Lebar (1920 / 1280 / 800)</option>
                    <option value="percentage">Skala Persentase (75%, 50%, 25%)</option>
                    <option value="custom">Kustom Lebar × Tinggi</option>
                  </select>
                </div>

                {settings.resizeMode === "preset" && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[1920, 1280, 800, 500].map((w) => (
                      <button
                        key={w}
                        onClick={() => updateSetting("maxWidth", w)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer",
                          settings.maxWidth === w
                            ? "bg-indigo-600 text-white border-indigo-500 font-bold"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                        )}
                      >
                        Maksimal {w}px
                      </button>
                    ))}
                  </div>
                )}

                {settings.resizeMode === "percentage" && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Persentase Skala</span>
                      <span className="text-indigo-400 font-bold">{settings.percentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={settings.percentage}
                      onChange={(e) => updateSetting("percentage", Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                )}

                {settings.resizeMode === "custom" && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-mono">Lebar (px)</label>
                      <input
                        type="number"
                        value={settings.customWidth}
                        onChange={(e) => {
                          const w = Number(e.target.value);
                          const newSt = {
                            ...settings,
                            customWidth: w,
                            customHeight:
                              settings.keepAspectRatio && activeImage?.originalWidth
                                ? Math.round((w * activeImage.originalHeight) / activeImage.originalWidth)
                                : settings.customHeight,
                          };
                          setSettings(newSt);
                          applySettingsRealtime(newSt);
                        }}
                        className="w-28 bg-[#08090d] border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white"
                      />
                    </div>

                    <span className="text-slate-500 text-base pt-4">×</span>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-mono">Tinggi (px)</label>
                      <input
                        type="number"
                        value={settings.customHeight}
                        onChange={(e) => updateSetting("customHeight", Number(e.target.value))}
                        className="w-28 bg-[#08090d] border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-white"
                      />
                    </div>

                    <button
                      onClick={() => updateSetting("keepAspectRatio", !settings.keepAspectRatio)}
                      className={cn(
                        "mt-5 p-2 rounded-xl border transition-colors cursor-pointer",
                        settings.keepAspectRatio
                          ? "bg-indigo-600/30 text-indigo-300 border-indigo-500"
                          : "bg-slate-900 text-slate-500 border-slate-800"
                      )}
                      title="Kunci Aspek Rasio"
                    >
                      {settings.keepAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: FILTERS & TRANSFORM */}
            {activeTab === "filters" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 animate-fadeIn">
                {/* Rotations & Flips */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-white block">Orientasi &amp; Posisi:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => updateSetting("rotation", (settings.rotation + 90) % 360)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Putar ({settings.rotation}°)</span>
                    </button>

                    <button
                      onClick={() => updateSetting("flipH", !settings.flipH)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer",
                        settings.flipH ? "bg-indigo-600/30 text-indigo-300 border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                      )}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Cermin Horizontal</span>
                    </button>

                    <button
                      onClick={() => updateSetting("flipV", !settings.flipV)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer",
                        settings.flipV ? "bg-indigo-600/30 text-indigo-300 border-indigo-500" : "bg-slate-900 text-slate-400 border-slate-800"
                      )}
                    >
                      <FlipVertical className="w-3.5 h-3.5" />
                      <span>Cermin Vertikal</span>
                    </button>

                    <button
                      onClick={() => updateSetting("isGrayscale", !settings.isGrayscale)}
                      className={cn(
                        "px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer",
                        settings.isGrayscale ? "bg-indigo-600/30 text-indigo-300 border-indigo-500 font-bold" : "bg-slate-900 text-slate-400 border-slate-800"
                      )}
                    >
                      Hitam Putih (Grayscale)
                    </button>
                  </div>
                </div>

                {/* Brightness & Contrast */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <SunMedium className="w-3.5 h-3.5 text-amber-400" /> Kecerahan
                      </span>
                      <span>{settings.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={settings.brightness}
                      onChange={(e) => updateSetting("brightness", Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Contrast className="w-3.5 h-3.5 text-indigo-400" /> Kontras
                      </span>
                      <span>{settings.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={settings.contrast}
                      onChange={(e) => updateSetting("contrast", Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. LIVE PREVIEW & INTERACTIVE COMPARISON */}
          {activeImage && (
            <div className="space-y-4">
              {/* Header Info & Switch View Mode */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0e17] border border-slate-800 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-white truncate max-w-[200px]">{activeImage.name}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{activeImage.compressedWidth} × {activeImage.compressedHeight} px</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-indigo-400 uppercase font-semibold">{settings.outputFormat.replace("image/", "")}</span>
                </div>

                <div className="flex items-center bg-[#08090d] p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setPreviewMode("split")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer",
                      previewMode === "split" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Split Slider</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode("sideBySide")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer",
                      previewMode === "sideBySide" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Berdampingan</span>
                  </button>
                </div>
              </div>

              {/* Split Slider Preview Mode */}
              {previewMode === "split" ? (
                <div
                  ref={splitContainerRef}
                  onMouseMove={(e) => isDraggingSplit && handleSplitMove(e.clientX)}
                  onTouchMove={(e) => e.touches[0] && handleSplitMove(e.touches[0].clientX)}
                  onMouseDown={() => setIsDraggingSplit(true)}
                  onMouseUp={() => setIsDraggingSplit(false)}
                  onTouchStart={() => setIsDraggingSplit(true)}
                  onTouchEnd={() => setIsDraggingSplit(false)}
                  className="relative w-full h-80 sm:h-96 md:h-[460px] bg-[#07090e] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none cursor-ew-resize"
                >
                  {/* Left: Original Layer */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                    <img
                      src={activeImage.originalUrl}
                      alt="Original"
                      className="max-w-full max-h-full object-contain"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-xs font-mono text-slate-300 border border-slate-700 shadow-lg">
                      <span className="text-slate-500 mr-1.5">ASLI:</span>
                      <span className="font-bold text-white">{formatBytes(activeImage.originalSize)}</span>
                    </div>
                  </div>

                  {/* Right: Compressed Layer (Clipped) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden p-4"
                    style={{ clipPath: `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)` }}
                  >
                    {activeImage.compressedUrl && (
                      <img
                        src={activeImage.compressedUrl}
                        alt="Compressed"
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                    <div className={cn(
                      "absolute top-4 right-4 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-mono shadow-lg font-bold border",
                      activeImage.compressedSize > activeImage.originalSize
                        ? "bg-amber-950/90 text-amber-300 border-amber-700/80"
                        : "bg-emerald-950/90 text-emerald-300 border-emerald-700/80"
                    )}>
                      <span className="mr-1.5">HASIL:</span>
                      <span>{formatBytes(activeImage.compressedSize)}</span>
                      {activeImage.compressedSize <= activeImage.originalSize ? (
                        <span className="ml-1.5 text-emerald-400">
                          (-
                          {activeImage.originalSize > 0
                            ? Math.round(((activeImage.originalSize - activeImage.compressedSize) / activeImage.originalSize) * 100)
                            : 0}
                          %)
                        </span>
                      ) : (
                        <span className="ml-1.5 text-amber-400">(Lossless PNG)</span>
                      )}
                    </div>
                  </div>

                  {/* Drag Line Indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)] pointer-events-none"
                    style={{ left: `${splitPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-2xl flex items-center justify-center text-white">
                      <Split className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Bottom Drag Guide */}
                  <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                    <span className="text-[11px] font-mono bg-black/70 px-3 py-1 rounded-full text-slate-400 border border-slate-800">
                      ↔ Geser garis untuk membandingkan piksel asli vs hasil
                    </span>
                  </div>
                </div>
              ) : (
                /* Side-by-Side Mode */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0c0e17] border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 font-bold">GAMBAR ASLI</span>
                      <span className="text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{formatBytes(activeImage.originalSize)}</span>
                    </div>
                    <div className="relative w-full h-72 bg-[#07090e] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 p-2">
                      <img
                        src={activeImage.originalUrl}
                        alt="Original"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="bg-[#0c0e17] border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold">HASIL TERKOMPRESI</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded border font-bold",
                        activeImage.compressedSize > activeImage.originalSize
                          ? "bg-amber-950/60 text-amber-300 border-amber-800"
                          : "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                      )}>
                        {formatBytes(activeImage.compressedSize)}
                      </span>
                    </div>
                    <div className="relative w-full h-72 bg-[#07090e] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 p-2">
                      {activeImage.compressedUrl && (
                        <img
                          src={activeImage.compressedUrl}
                          alt="Compressed"
                          className="max-w-full max-h-full object-contain"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Download Active Image Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleDownloadSingle(activeImage)}
                  disabled={!activeImage.compressedUrl}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Gambar Ini ({formatBytes(activeImage.compressedSize)})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

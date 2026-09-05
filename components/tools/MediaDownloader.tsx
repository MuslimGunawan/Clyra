"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  DownloadCloud, 
  Download, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Video, 
  Music, 
  Image as ImageIcon, 
  ShieldAlert, 
  Copy, 
  Film, 
  CheckCircle2, 
  AlertCircle,
  HardDriveDownload,
  Flame,
  Activity,
  Camera,
  Play,
  Pause,
  Info,
  Clipboard,
  X,
  ListMusic,
  Radio,
  Search,
  Square,
  PlayCircle
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";

type PlatformType = "youtube" | "tiktok" | "instagram" | "facebook" | "twitter" | "pinterest" | "spotify" | "universal";

interface DownloadOption {
  id: string;
  quality: string;
  format: "mp4" | "mp3" | "jpg";
  size?: string;
  type: "video" | "audio" | "image";
  label: string;
  directDownloadUrl: string;
  filename: string;
  safeTitle?: string;
  needsProcessing?: boolean;
  cleanUrl?: string;
  searchQuery?: string;
  isInstagram?: boolean;
}

interface SpotifyTrackItem {
  id: string;
  trackNumber: number;
  title: string;
  artist: string;
  durationFormatted: string;
  durationMs: number;
  previewUrl: string | null;
  query: string;
  uri?: string;
}

export default function MediaDownloader() {
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDownloadId, setActiveDownloadId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStatusText, setDownloadStatusText] = useState<string>("");
  const [currentStepBadge, setCurrentStepBadge] = useState<string>("");
  const [isDownloadDone, setIsDownloadDone] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Spotify-specific states
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [trackFilter, setTrackFilter] = useState("");
  const [trackDownloadingId, setTrackDownloadingId] = useState<string | null>(null);
  const [trackStatusMap, setTrackStatusMap] = useState<Record<string, "downloading" | "done" | "error">>({});
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentTitle: string }>({
    current: 0,
    total: 0,
    currentTitle: "",
  });
  const cancelBatchRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [extractedData, setExtractedData] = useState<{
    title: string;
    platform: PlatformType;
    contentTypeLabel?: string;
    thumbnail: string;
    videoPreviewUrl?: string;
    isEmbed?: boolean;
    isPlayableVideo?: boolean;
    author: string;
    options: DownloadOption[];
    spotifyType?: "track" | "playlist" | "album" | "artist";
    totalTracks?: number;
    tracks?: SpotifyTrackItem[];
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smart Platform and Content-Type Detection Logic
  const detectedPlatform = useMemo((): { type: PlatformType; name: string; color: string } => {
    const cleanUrl = url.toLowerCase().trim();
    if (cleanUrl.includes("spotify.com") || cleanUrl.includes("spotify.link")) {
      if (cleanUrl.includes("/playlist/")) {
        return { type: "spotify", name: "Spotify Playlist (Lagu & Album MP3)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
      }
      if (cleanUrl.includes("/album/")) {
        return { type: "spotify", name: "Spotify Album (Koleksi Lagu Lengkap)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
      }
      return { type: "spotify", name: "Spotify Music (Lagu MP3 320kbps)", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    }
    if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
      return { type: "youtube", name: "YouTube (1080p Full HD / MP3)", color: "text-red-400 bg-red-500/10 border-red-500/30" };
    }
    if (cleanUrl.includes("instagram.com")) {
      if (cleanUrl.includes("/reel/") || cleanUrl.includes("/reels/")) {
        return { type: "instagram", name: "Instagram Reel (100% Kualitas Asli)", color: "text-pink-400 bg-pink-500/10 border-pink-500/30" };
      }
      if (cleanUrl.includes("/p/")) {
        return { type: "instagram", name: "Instagram Post (Foto / Video)", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" };
      }
      if (cleanUrl.includes("/stories/")) {
        return { type: "instagram", name: "Instagram Story", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
      }
      return { type: "instagram", name: "Instagram Media (HD)", color: "text-pink-400 bg-pink-500/10 border-pink-500/30" };
    }
    if (cleanUrl.includes("tiktok.com")) {
      return { type: "tiktok", name: "TikTok (No Watermark HD)", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" };
    }
    if (cleanUrl.includes("facebook.com") || cleanUrl.includes("fb.watch")) {
      return { type: "facebook", name: "Facebook (HD Video)", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" };
    }
    if (cleanUrl.includes("twitter.com") || cleanUrl.includes("x.com")) {
      return { type: "twitter", name: "Twitter / X (MP4)", color: "text-slate-300 bg-slate-800 border-slate-700" };
    }
    return { type: "universal", name: "Universal Media Extractor", color: "text-slate-400 bg-slate-900 border-slate-800" };
  }, [url]);

  // One-click clipboard paste handler
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        showToast("Tautan berhasil ditempel!", "info");
      }
    } catch (err) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      showToast("Gunakan Ctrl+V untuk menempel tautan.", "info");
    }
  };

  // Clear input handler
  const handleClear = () => {
    setUrl("");
    setErrorMessage(null);
    setTrackFilter("");
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingTrackId(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setExtractedData(null);
    setActiveDownloadId(null);
    setTrackStatusMap({});
    setTrackFilter("");
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingTrackId(null);

    const cleanUrl = url.trim();

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal mengambil data media.");
      }

      setExtractedData(data);
      showToast("Data media berhasil diekstrak!", "success");
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses link media. Pastikan link publik.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Safe In-House Media Downloader with Psychological Continuous Easing
  const handleDownload = async (opt: DownloadOption) => {
    setActiveDownloadId(opt.id);
    setDownloadProgress(12);
    setIsDownloadDone(false);
    setCurrentStepBadge("Langkah 1/3");
    setDownloadStatusText("Menginisialisasi pipeline render Clyra...");
    showToast(`Memproses ${opt.quality}...`, "info");

    let progressVal = 12;

    const progressTimer = setInterval(() => {
      if (progressVal < 35) {
        progressVal += 6;
        setCurrentStepBadge("Langkah 1/3");
        setDownloadStatusText(
          opt.isInstagram
            ? "Mengunduh stream Instagram kualitas penuh..."
            : opt.type === "audio"
            ? "Mencari & menyelaraskan trek audio MP3 320kbps..."
            : "Mengunduh stream biner resolusi penuh (1080p)..."
        );
      } else if (progressVal < 70) {
        progressVal += 4;
        setCurrentStepBadge("Langkah 2/3");
        setDownloadStatusText(
          opt.type === "audio"
            ? "Mengekstrak trek audio & mastering MP3 320kbps murni..."
            : "Menggabungkan video lossless & audio stereo via engine FFmpeg..."
        );
      } else if (progressVal < 88) {
        progressVal += 1.5;
        setCurrentStepBadge("Langkah 2/3");
        setDownloadStatusText("Menyelaraskan sinkronisasi audio-video & bitrate...");
      } else if (progressVal < 97) {
        progressVal += 0.4;
        setCurrentStepBadge("Langkah 3/3");
        setDownloadStatusText("Memfinalisasi header MP3/MP4 & metadata container...");
      }
      setDownloadProgress(Math.min(Math.round(progressVal), 97));
    }, 280);

    try {
      let finalDownloadUrl = opt.directDownloadUrl;

      // On-demand in-house processing for YouTube / Instagram / Spotify
      if (opt.needsProcessing && opt.cleanUrl) {
        const res = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "download_stream",
            url: opt.cleanUrl,
            searchQuery: opt.searchQuery,
            formatType: opt.type,
            safeTitle: opt.safeTitle,
            isInstagram: opt.isInstagram,
          }),
        });

        const resData = await res.json();
        if (!res.ok || !resData.downloadUrl) {
          throw new Error(resData.error || "Gagal merender file media.");
        }
        finalDownloadUrl = resData.downloadUrl;
      }

      clearInterval(progressTimer);
      setDownloadProgress(99);
      setCurrentStepBadge("Langkah 3/3");
      setDownloadStatusText("Mengirim file ke folder Download perangkat Anda...");

      // Native browser download trigger
      const a = document.createElement("a");
      a.href = finalDownloadUrl;
      a.download = opt.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => {
        setDownloadProgress(100);
        setCurrentStepBadge("Selesai");
        setDownloadStatusText(`File "${opt.filename}" berhasil tersimpan!`);
        setIsDownloadDone(true);
        showToast("Unduhan selesai disimpan!", "success");
        setTimeout(() => {
          setActiveDownloadId(null);
        }, 3500);
      }, 500);
    } catch (e: any) {
      clearInterval(progressTimer);
      setDownloadStatusText(e.message || "Gagal memproses unduhan.");
      showToast(e.message || "Terjadi kesalahan saat memproses media.", "error");
      setTimeout(() => {
        setActiveDownloadId(null);
      }, 3500);
    }
  };

  // Spotify Track Downloader (Single Track from Playlist/Album)
  const handleDownloadSpotifyTrack = async (track: SpotifyTrackItem) => {
    setTrackDownloadingId(track.id);
    setTrackStatusMap((prev) => ({ ...prev, [track.id]: "downloading" }));
    showToast(`Memulai konversi "${track.title}"...`, "info");

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "download_stream",
          url: url || "https://open.spotify.com",
          searchQuery: track.query,
          formatType: "audio",
          safeTitle: `${track.artist} - ${track.title}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.downloadUrl) {
        throw new Error(data.error || "Gagal mengonversi lagu.");
      }

      const a = document.createElement("a");
      a.href = data.downloadUrl;
      a.download = `${track.artist} - ${track.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTrackStatusMap((prev) => ({ ...prev, [track.id]: "done" }));
      showToast(`"${track.title}" berhasil diunduh!`, "success");
    } catch (err: any) {
      setTrackStatusMap((prev) => ({ ...prev, [track.id]: "error" }));
      showToast(err.message || "Gagal mengunduh lagu", "error");
    } finally {
      setTrackDownloadingId(null);
    }
  };

  // Batch Sequential Queue Downloader for Spotify Playlists / Albums
  const handleStartBatchDownload = async (tracksToDownload: SpotifyTrackItem[]) => {
    if (tracksToDownload.length === 0) return;
    setIsBatchRunning(true);
    cancelBatchRef.current = false;
    setBatchProgress({ current: 0, total: tracksToDownload.length, currentTitle: "" });

    for (let i = 0; i < tracksToDownload.length; i++) {
      if (cancelBatchRef.current) break;
      const track = tracksToDownload[i];
      setBatchProgress({ current: i + 1, total: tracksToDownload.length, currentTitle: track.title });
      await handleDownloadSpotifyTrack(track);
      // Brief pause between downloads to avoid browser pop-up blocking
      await new Promise((r) => setTimeout(r, 1200));
    }

    setIsBatchRunning(false);
    showToast("Proses antrean unduhan selesai!", "success");
  };

  const handleCancelBatch = () => {
    cancelBatchRef.current = true;
    setIsBatchRunning(false);
    showToast("Antrean unduhan dibatalkan.", "info");
  };

  // Play / Pause 30-second Official Audio Preview
  const togglePlayPreview = (trackId: string, previewUrl: string | null) => {
    if (!previewUrl) {
      showToast("Audio preview tidak tersedia untuk lagu ini", "info");
      return;
    }

    if (playingTrackId === trackId) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = previewUrl;
        audioRef.current.play().catch(() => {});
        setPlayingTrackId(trackId);
      }
    }
  };

  const handleCopyLink = async (downloadUrl: string, id: string) => {
    try {
      const fullUrl = downloadUrl.startsWith("/")
        ? `${window.location.origin}${downloadUrl}`
        : downloadUrl;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      showToast("Tautan unduhan tersalin!", "copied");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSampleUrl = (platform: "yt" | "tiktok" | "ig" | "spotify") => {
    if (platform === "spotify") {
      setUrl("https://open.spotify.com/playlist/1h9y9RFK7g41jMCXTxwdgJ?si=d83090344ef54fb1");
    } else if (platform === "tiktok") {
      setUrl("https://www.tiktok.com/@alirezashahbazi_official/video/7311140026363022597");
    } else if (platform === "yt") {
      setUrl("https://youtu.be/Xt_4xd6wxss");
    } else {
      setUrl("https://www.instagram.com/reel/DcGTWI-xce4/");
    }
  };

  // Filtered tracks for playlist search
  const filteredTracks = useMemo(() => {
    if (!extractedData?.tracks) return [];
    if (!trackFilter.trim()) return extractedData.tracks;
    const q = trackFilter.toLowerCase().trim();
    return extractedData.tracks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
  }, [extractedData?.tracks, trackFilter]);

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Hidden Audio Element for Previews */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingTrackId(null)}
        onError={() => setPlayingTrackId(null)}
      />

      {/* Early Access / Beta Development Notice */}
      <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-300">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <span>Tahap Pengembangan &amp; Early Access</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              BETA v1.1
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Platform Clyra kini mendukung ekstraksi dan pengunduhan musik dari <strong>Spotify (Lagu, Playlist &amp; Album)</strong>, YouTube (1080p/MP3), TikTok tanpa watermark, dan Instagram Reels.
          </p>
        </div>
      </div>

      {/* Search and Input Form */}
      <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DownloadCloud className="w-5 h-5 text-indigo-400" />
              <span>Universal Media &amp; Audio Downloader</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ekstrak &amp; unduh lagu/playlist <strong>Spotify</strong>, video <strong>YouTube 1080p/MP3</strong>, <strong>Instagram Reel/Post</strong>, &amp; <strong>TikTok</strong> tanpa watermark.
            </p>
          </div>

          {/* Supported platform badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              Spotify
            </span>
            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-bold">
              YouTube
            </span>
            <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/30 font-bold">
              Instagram
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
              TikTok
            </span>
          </div>
        </div>

        <form onSubmit={handleExtract} className="space-y-3">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Tempel tautan Spotify (Track/Playlist/Album), YouTube, TikTok, atau Instagram..."
              className="w-full bg-[#08090d] border border-slate-800 focus:border-indigo-500 rounded-xl pl-4 pr-32 py-3.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition-all shadow-inner font-mono"
            />

            {/* Clear & Paste buttons */}
            <div className="absolute right-28 flex items-center gap-1">
              {url && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Hapus input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handlePaste}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center gap-1"
                title="Tempel dari Clipboard"
              >
                <Clipboard className="w-3 h-3" />
                <span className="hidden sm:inline">Paste</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !url.trim()}
              className="absolute right-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Proses...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4" />
                  <span>Ambil Media</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Paste Sample Links & Detected Status Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span>Uji coba cepat:</span>
              <button
                type="button"
                onClick={() => loadSampleUrl("spotify")}
                className="text-emerald-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <Music className="w-3.5 h-3.5" />
                <span>Spotify Playlist</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => loadSampleUrl("ig")}
                className="text-pink-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Instagram Reel</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => loadSampleUrl("yt")}
                className="text-red-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>YouTube Video</span>
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => loadSampleUrl("tiktok")}
                className="text-cyan-400 hover:underline font-medium cursor-pointer"
              >
                TikTok Video
              </button>
            </div>

            {url && (
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${detectedPlatform.color}`}>
                Terdeteksi: {detectedPlatform.name}
              </span>
            )}
          </div>
        </form>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 flex items-center gap-2.5 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Realtime In-House Download Progress Card */}
      {activeDownloadId && (
        <div className="bg-gradient-to-r from-indigo-950/50 via-purple-950/40 to-[#0e111a] border border-indigo-500/50 rounded-2xl p-5 shadow-2xl space-y-3.5 animate-slideUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/40">
                {isDownloadDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <HardDriveDownload className="w-4 h-4 text-indigo-400 animate-bounce" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Mesin Render Clyra (FFmpeg + yt-dlp)</span>
                  {currentStepBadge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                      {currentStepBadge}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-300 font-mono flex items-center gap-1.5 mt-0.5">
                  <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
                  <span>{downloadStatusText}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-base font-mono font-bold text-indigo-300">
                {downloadProgress}%
              </span>
            </div>
          </div>

          {/* Animated Smooth Progress Bar */}
          <div className="relative w-full bg-slate-900/90 rounded-full h-3 overflow-hidden border border-slate-800 shadow-inner">
            <div
              className={`h-full transition-all duration-300 ease-out rounded-full relative overflow-hidden ${
                isDownloadDone
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/30"
                  : "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 shadow-lg shadow-indigo-500/30"
              }`}
              style={{ width: `${downloadProgress}%` }}
            >
              {!isDownloadDone && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite] -skew-x-12" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Extracted Results Grid */}
      {extractedData && (
        <div className="bg-[#0e111a] border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
          {/* Media Header Information */}
          <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-slate-800">
            {/* Thumbnail / Player Box */}
            <div className="relative w-full md:w-80 bg-black rounded-2xl overflow-hidden shrink-0 border border-slate-800 shadow-2xl flex items-center justify-center group">
              {extractedData.isEmbed && extractedData.platform === "youtube" && extractedData.videoPreviewUrl ? (
                <iframe
                  src={extractedData.videoPreviewUrl}
                  title={extractedData.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-56 rounded-xl border-0 bg-black"
                />
              ) : extractedData.isPlayableVideo && extractedData.videoPreviewUrl ? (
                <video
                  controls
                  playsInline
                  poster={extractedData.thumbnail}
                  src={extractedData.videoPreviewUrl}
                  className="w-full max-h-56 object-contain rounded-xl"
                />
              ) : (
                /* Crisp HD Cover Card with Overlay */
                <div className="relative w-full h-56 overflow-hidden flex items-center justify-center bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={extractedData.thumbnail}
                    alt={extractedData.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-4">
                    <div className="flex items-center gap-2.5">
                      <span className={`p-2 rounded-full text-white shadow-lg backdrop-blur-md ${
                        extractedData.platform === "spotify" ? "bg-emerald-500/90" : "bg-pink-500/90"
                      }`}>
                        {extractedData.platform === "spotify" ? (
                          <Music className="w-4 h-4 fill-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white" />
                        )}
                      </span>
                      <div>
                        <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                          {extractedData.contentTypeLabel || "Media HD"}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Kualitas Asli Source Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  extractedData.platform === "spotify"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-pink-500/20 text-pink-300 border-pink-500/30"
                }`}>
                  {extractedData.contentTypeLabel || extractedData.platform}
                </span>
                <span className="text-xs text-slate-300 font-mono font-semibold bg-slate-800 px-2 py-0.5 rounded">
                  {extractedData.author}
                </span>
                {extractedData.totalTracks && extractedData.totalTracks > 1 && (
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    {extractedData.totalTracks} Lagu
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {extractedData.title}
              </h3>

              <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {extractedData.platform === "spotify" && extractedData.tracks && extractedData.tracks.length > 1
                    ? "Daftar lagu berhasil dimuat. Unduh per lagu atau jalankan antrean unduhan di bawah:"
                    : "Media berhasil diproses. Klik tombol download di bawah untuk mengunduh:"}
                </span>
              </p>
            </div>
          </div>

          {/* SPOTIFY PLAYLIST / ALBUM INTERACTIVE TRACKLIST */}
          {extractedData.platform === "spotify" && extractedData.tracks && extractedData.tracks.length > 1 && (
            <div className="space-y-4 pt-2">
              {/* Header Controls for Playlist */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/80 border border-emerald-950">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                    <ListMusic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Koleksi Lagu ({extractedData.tracks.length} Lagu Ditemukan)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Dengarkan preview atau klik tombol unduh pada masing-masing lagu.
                    </div>
                  </div>
                </div>

                {/* Batch Action Buttons */}
                <div className="flex items-center gap-2">
                  {isBatchRunning ? (
                    <button
                      onClick={handleCancelBatch}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold shadow transition-all cursor-pointer"
                    >
                      <Square className="w-3 h-3 fill-white" />
                      <span>Hentikan Antrean</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartBatchDownload(filteredTracks)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                      title="Unduh semua lagu secara berurutan"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>⚡ Download Semua ({filteredTracks.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Batch Running Progress Bar */}
              {isBatchRunning && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>
                        Mengunduh Lagu {batchProgress.current} dari {batchProgress.total}: &quot;{batchProgress.currentTitle}&quot;
                      </span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">
                      {Math.round((batchProgress.current / (batchProgress.total || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round((batchProgress.current / (batchProgress.total || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Search filter for songs inside playlist */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={trackFilter}
                  onChange={(e) => setTrackFilter(e.target.value)}
                  placeholder={`Cari dari ${extractedData.tracks.length} lagu (ketik judul atau penyanyi)...`}
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-colors font-mono"
                />
              </div>

              {/* Tracklist Items */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredTracks.map((track) => {
                  const isPlaying = playingTrackId === track.id;
                  const isDownloading = trackDownloadingId === track.id;
                  const trackStatus = trackStatusMap[track.id];

                  return (
                    <div
                      key={track.id}
                      className="bg-[#08090d] border border-slate-800/80 hover:border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-3 transition-all group"
                    >
                      {/* Track info & play button */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-center text-xs font-mono font-bold text-slate-500 group-hover:text-emerald-400 shrink-0">
                          {track.trackNumber}
                        </span>

                        {/* Preview play button */}
                        <button
                          type="button"
                          onClick={() => togglePlayPreview(track.id, track.previewUrl)}
                          disabled={!track.previewUrl}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                            isPlaying
                              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                              : track.previewUrl
                              ? "bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 border border-slate-700"
                              : "bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800"
                          }`}
                          title={track.previewUrl ? "Putar Preview 30 Detik" : "Preview tidak tersedia"}
                        >
                          {isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-200 truncate">
                            {track.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-2">
                            <span>{track.artist}</span>
                            <span className="text-slate-600">•</span>
                            <span className="font-mono text-slate-500">{track.durationFormatted}</span>
                          </div>
                        </div>
                      </div>

                      {/* Download Track Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        {trackStatus === "done" && (
                          <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Tersimpan</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownloadSpotifyTrack(track)}
                          disabled={isDownloading || isBatchRunning}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {isDownloading ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span className="hidden sm:inline">Konversi...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              <span>MP3</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredTracks.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono">
                    Tidak ada lagu yang cocok dengan &quot;{trackFilter}&quot;
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Download Options (Single Track, Direct Cover Art, etc.) */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
              {extractedData.platform === "spotify" && extractedData.tracks && extractedData.tracks.length > 1
                ? "Format Tambahan & Cover Art"
                : "Pilihan Format & Kualitas Unduhan Langsung"}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {extractedData.options.map((opt) => (
                <div
                  key={opt.id}
                  className="bg-[#08090d] border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 flex items-center justify-between gap-4 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                      {opt.type === "video" && <Film className="w-5 h-5" />}
                      {opt.type === "audio" && <Music className="w-5 h-5" />}
                      {opt.type === "image" && <ImageIcon className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate">{opt.quality}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {opt.label} {opt.size && <>• <span className="font-mono text-indigo-300 font-semibold">{opt.size}</span></>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyLink(opt.directDownloadUrl, opt.id)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                      title="Salin Tautan"
                    >
                      {copiedId === opt.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDownload(opt)}
                      disabled={activeDownloadId === opt.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {activeDownloadId === opt.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{downloadProgress}%</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Safety & Legal Terms Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-slate-300">Kebijakan Penggunaan Legal: </span>
          Alat ini disediakan semata-mata untuk keperluan backup pribadi dan konten bebas hak cipta. Pengguna bertanggung jawab penuh atas kepatuhan hukum dan hak cipta atas materi yang diunduh.
        </div>
      </div>
    </div>
  );
}

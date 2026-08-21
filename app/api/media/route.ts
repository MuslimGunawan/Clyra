import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { 
  isSafePublicUrl, 
  sanitizeFilename, 
  checkRateLimit, 
  generateObfuscatedId, 
  encodeObfuscatedToken 
} from "@/lib/security";

const execFileAsync = promisify(execFile);

// Helper to extract clean YouTube video ID
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Locate FFmpeg binary dynamically from imageio_ffmpeg
async function getFfmpegPath(): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("python", [
      "-c",
      "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())",
    ]);
    return stdout.trim() || null;
  } catch (e) {
    return null;
  }
}

// Cleanup old files in public/downloads (> 2 hours old) to prevent disk exhaustion
function cleanupDownloadsDir(downloadsDir: string) {
  try {
    if (!fs.existsSync(downloadsDir)) return;
    const now = Date.now();
    const maxAgeMs = 2 * 60 * 60 * 1000; // 2 hours
    const files = fs.readdirSync(downloadsDir);

    for (const file of files) {
      const filePath = path.join(downloadsDir, file);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error("Cleanup downloads error:", err);
  }
}

// Download Media in-house with FFmpeg lossless stream passthrough & Obfuscated Tokenized storage
async function downloadInHouseMedia(
  targetUrl: string,
  rawTitle: string,
  type: "video" | "audio",
  isInstagram = false
): Promise<string | null> {
  try {
    // Generate an elegant, non-guessable alphanumeric hash for physical storage
    const obfuscatedKey = generateObfuscatedId("cly", 16);
    const downloadsDir = path.resolve(process.cwd(), "public", "downloads");
    
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    } else {
      cleanupDownloadsDir(downloadsDir);
    }

    const ext = type === "audio" ? "mp3" : "mp4";
    const outputFile = path.resolve(downloadsDir, `${obfuscatedKey}.${ext}`);

    // Path traversal defense check
    if (!outputFile.startsWith(downloadsDir)) {
      throw new Error("Invalid output file path target.");
    }

    const ffmpegPath = await getFfmpegPath();
    const ffmpegArgs = ffmpegPath ? ["--ffmpeg-location", ffmpegPath] : [];

    if (type === "audio") {
      const extractorArgs = isInstagram
        ? []
        : ["--extractor-args", "youtube:player_client=web_embedded,android"];

      await execFileAsync(
        "python",
        [
          "-m",
          "yt_dlp",
          ...ffmpegArgs,
          ...extractorArgs,
          "--no-playlist",
          "-f",
          "bestaudio/best",
          "-x",
          "--audio-format",
          "mp3",
          "--audio-quality",
          "0",
          "-o",
          outputFile,
          "--", // Parameter injection shield
          targetUrl,
        ],
        { timeout: 70000 }
      );
    } else {
      const extractorArgs = isInstagram
        ? []
        : ["--extractor-args", "youtube:player_client=web_embedded,android"];

      await execFileAsync(
        "python",
        [
          "-m",
          "yt_dlp",
          ...ffmpegArgs,
          ...extractorArgs,
          "--no-playlist",
          "-f",
          "bestvideo+bestaudio/best",
          "--merge-output-format",
          "mp4",
          "-o",
          outputFile,
          "--", // Parameter injection shield
          targetUrl,
        ],
        { timeout: 90000 }
      );
    }

    if (fs.existsSync(outputFile)) {
      return `/downloads/${obfuscatedKey}.${ext}`;
    }
  } catch (err) {
    console.error("Local media processing error:", err);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = checkRateLimit(ip.split(",")[0].trim(), 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Silakan tunggu beberapa saat." },
        { status: 429 }
      );
    }

    const { url, action, formatType, safeTitle: requestedTitle, isInstagram } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL tidak valid" }, { status: 400 });
    }

    const rawUrl = url.trim();

    // 2. SSRF & Scheme Validation
    if (!isSafePublicUrl(rawUrl)) {
      return NextResponse.json(
        { error: "URL tidak diizinkan atau tidak aman." },
        { status: 400 }
      );
    }

    // 3. ACTION: ON-DEMAND IN-HOUSE DOWNLOAD
    if (action === "download_stream") {
      const isIg = Boolean(isInstagram || rawUrl.includes("instagram.com"));
      let cleanTargetUrl = rawUrl;

      if (!isIg && (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be"))) {
        const ytId = getYouTubeId(rawUrl);
        if (ytId) cleanTargetUrl = `https://www.youtube.com/watch?v=${ytId}`;
      }

      const safeTitle = sanitizeFilename(requestedTitle, `clyra_media_${Date.now()}`);
      const fileUrl = await downloadInHouseMedia(
        cleanTargetUrl,
        safeTitle,
        formatType === "audio" ? "audio" : "video",
        isIg
      );

      if (fileUrl) {
        return NextResponse.json({ success: true, downloadUrl: fileUrl });
      }
      return NextResponse.json({ error: "Gagal merender file media." }, { status: 500 });
    }

    // 4. INSTAGRAM EXTRACTION
    if (rawUrl.includes("instagram.com")) {
      const isReel = rawUrl.includes("/reel/") || rawUrl.includes("/reels/");
      const isStory = rawUrl.includes("/stories/");
      const isTV = rawUrl.includes("/tv/");
      const postTypeLabel = isReel
        ? "Instagram Reel (100% Kualitas Asli)"
        : isStory
        ? "Instagram Story"
        : isTV
        ? "Instagram TV (IGTV)"
        : "Instagram Post (Foto / Video)";

      let igTitle = "Instagram Media";
      let igAuthor = "@instagram_user";
      let igThumb = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";

      try {
        const { stdout } = await execFileAsync(
          "python",
          ["-m", "yt_dlp", "--dump-json", "--no-playlist", "--", rawUrl],
          { timeout: 15000 }
        );

        if (stdout) {
          const igMeta = JSON.parse(stdout);
          if (igMeta.title && igMeta.title !== "Video by " && !igMeta.title.startsWith("Video by")) {
            igTitle = igMeta.title;
          } else if (igMeta.description) {
            igTitle = igMeta.description.split("\n")[0].slice(0, 70);
          } else if (igMeta.fulltitle) {
            igTitle = igMeta.fulltitle;
          }
          if (igMeta.uploader || igMeta.channel) {
            igAuthor = `@${igMeta.uploader || igMeta.channel}`;
          }
          if (igMeta.thumbnail && isSafePublicUrl(igMeta.thumbnail)) {
            igThumb = igMeta.thumbnail;
          }
        }
      } catch (err) {
        console.error("IG yt-dlp metadata error:", err);
      }

      const safeTitle = sanitizeFilename(`IG_${igAuthor.replace("@", "")}_${igTitle}`, `IG_${Date.now()}`);
      const coverToken = encodeObfuscatedToken({
        url: igThumb,
        filename: `${safeTitle}_cover.jpg`,
        type: "direct",
      });
      const coverDownloadUrl = `/api/media/download?token=${coverToken}`;

      return NextResponse.json({
        title: igTitle || (isReel ? "Instagram Reel Video" : "Instagram Post Media"),
        author: igAuthor,
        thumbnail: igThumb,
        platform: "instagram",
        contentTypeLabel: postTypeLabel,
        videoPreviewUrl: igThumb,
        isEmbed: false,
        options: [
          {
            id: "ig_video",
            quality: isReel ? "Video Reel (100% Kualitas Asli Source)" : "Video Postingan (Kualitas Asli)",
            format: "mp4",
            size: "Kualitas Asli Source",
            type: "video",
            label: isReel ? "Download Video Reel Kualitas Penuh" : "Download Video Instagram Asli",
            directDownloadUrl: `/downloads/${generateObfuscatedId("cly_ig")}.mp4`,
            filename: `${safeTitle}.mp4`,
            safeTitle,
            needsProcessing: true,
            cleanUrl: rawUrl,
            isInstagram: true,
          },
          {
            id: "ig_audio",
            quality: "Audio / Sound MP3 (320 kbps)",
            format: "mp3",
            size: "Audio 320kbps",
            type: "audio",
            label: "Download Musik / Audio Instagram Saja",
            directDownloadUrl: `/downloads/${generateObfuscatedId("cly_ig_aud")}.mp3`,
            filename: `${safeTitle}.mp3`,
            safeTitle,
            needsProcessing: true,
            cleanUrl: rawUrl,
            isInstagram: true,
          },
          {
            id: "ig_cover",
            quality: "Foto Cover Thumbnail (Direct Download)",
            format: "jpg",
            size: "Foto HD Asli",
            type: "image",
            label: "Download Langsung Foto Cover Asli",
            directDownloadUrl: coverDownloadUrl,
            filename: `${safeTitle}_cover.jpg`,
            safeTitle,
          },
        ],
      });
    }

    // 5. TIKTOK EXTRACTION
    if (rawUrl.includes("tiktok.com")) {
      try {
        const tikRes = await fetch(
          `https://www.tikwm.com/api/?url=${encodeURIComponent(rawUrl)}`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );
        const tikData = await tikRes.json();

        if (tikData && tikData.code === 0 && tikData.data) {
          const t = tikData.data;
          const playUrl = t.play.startsWith("http") ? t.play : `https://www.tikwm.com${t.play}`;
          const hdPlayUrl = t.hdplay ? (t.hdplay.startsWith("http") ? t.hdplay : `https://www.tikwm.com${t.hdplay}`) : playUrl;
          const musicUrl = t.music ? (t.music.startsWith("http") ? t.music : `https://www.tikwm.com${t.music}`) : null;
          const coverUrl = t.cover.startsWith("http") ? t.cover : `https://www.tikwm.com${t.cover}`;
          const safeTitle = sanitizeFilename(t.title || "tiktok_video", "tiktok_video");
          const coverToken = encodeObfuscatedToken({
            url: coverUrl,
            filename: `${safeTitle}_cover.jpg`,
            type: "direct",
          });
          const coverDownloadUrl = `/api/media/download?token=${coverToken}`;

          return NextResponse.json({
            title: t.title || "TikTok Video Tanpa Watermark",
            author: `@${t.author?.unique_id || t.author?.nickname || "creator"}`,
            thumbnail: coverUrl,
            videoPreviewUrl: playUrl,
            isPlayableVideo: true,
            platform: "tiktok",
            contentTypeLabel: "TikTok Video (100% Kualitas Asli)",
            options: [
              {
                id: "tt_hd",
                quality: "HD Video 1080p (Tanpa Watermark)",
                format: "mp4",
                size: t.size ? `${(t.size / (1024 * 1024)).toFixed(1)} MB` : "Full HD",
                type: "video",
                label: "Download Video MP4 Full HD",
                directDownloadUrl: hdPlayUrl,
                filename: `${safeTitle}_HD.mp4`,
                safeTitle,
              },
              {
                id: "tt_sd",
                quality: "SD Video Standar",
                format: "mp4",
                size: "Fast MP4",
                type: "video",
                label: "Download Video MP4 Standar",
                directDownloadUrl: playUrl,
                filename: `${safeTitle}_SD.mp4`,
                safeTitle,
              },
              ...(musicUrl
                ? [
                    {
                      id: "tt_audio",
                      quality: "Audio MP3 Asli",
                      format: "mp3",
                      size: "Original Sound",
                      type: "audio",
                      label: "Download Musik / Sound TikTok",
                      directDownloadUrl: musicUrl,
                      filename: `${safeTitle}_audio.mp3`,
                      safeTitle,
                    },
                  ]
                : []),
              {
                id: "tt_cover",
                quality: "Cover Foto (Direct Download)",
                format: "jpg",
                size: "Cover HD",
                type: "image",
                label: "Download Thumbnail Cover",
                directDownloadUrl: coverDownloadUrl,
                filename: `${safeTitle}_cover.jpg`,
                safeTitle,
              },
            ],
          });
        }
      } catch (err) {
        console.error("TikTok extract error:", err);
      }
    }

    // 6. YOUTUBE EXTRACTION
    if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
      const ytId = getYouTubeId(rawUrl);
      if (!ytId) {
        return NextResponse.json({ error: "ID YouTube tidak ditemukan." }, { status: 400 });
      }

      const cleanYtUrl = `https://www.youtube.com/watch?v=${ytId}`;

      let videoTitle = "YouTube Video";
      let videoAuthor = "YouTube Creator";
      let videoThumb = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;

      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(cleanYtUrl)}&format=json`);
        if (oembedRes.ok) {
          const odata = await oembedRes.json();
          if (odata.title) videoTitle = odata.title;
          if (odata.author_name) videoAuthor = odata.author_name;
          if (odata.thumbnail_url && isSafePublicUrl(odata.thumbnail_url)) videoThumb = odata.thumbnail_url;
        }
      } catch (e) {}

      const safeTitle = sanitizeFilename(videoTitle, `yt_${ytId}`);
      const coverToken = encodeObfuscatedToken({
        url: videoThumb,
        filename: `${safeTitle}_thumb.jpg`,
        type: "direct",
      });
      const coverDownloadUrl = `/api/media/download?token=${coverToken}`;

      return NextResponse.json({
        title: videoTitle,
        author: videoAuthor,
        thumbnail: videoThumb,
        videoPreviewUrl: `https://www.youtube.com/embed/${ytId}`,
        isEmbed: true,
        platform: "youtube",
        contentTypeLabel: "YouTube Video (100% Kualitas Asli)",
        options: [
          {
            id: "yt_video",
            quality: "Video Full HD (100% Kualitas Asli Source)",
            format: "mp4",
            size: "Original Bitrate (Tanpa Kompresi)",
            type: "video",
            label: "Download Video MP4 Kualitas Penuh",
            directDownloadUrl: `/downloads/${generateObfuscatedId("cly_yt")}.mp4`,
            filename: `${safeTitle}.mp4`,
            safeTitle,
            needsProcessing: true,
            cleanUrl: cleanYtUrl,
          },
          {
            id: "yt_audio",
            quality: "Audio MP3 Murni (320 kbps High Quality)",
            format: "mp3",
            size: "320kbps MP3",
            type: "audio",
            label: "Download Lagu / Musik MP3 Murni",
            directDownloadUrl: `/downloads/${generateObfuscatedId("cly_yt_aud")}.mp3`,
            filename: `${safeTitle}.mp3`,
            safeTitle,
            needsProcessing: true,
            cleanUrl: cleanYtUrl,
          },
          {
            id: "yt_cover",
            quality: "Cover Thumbnail (Direct Download)",
            format: "jpg",
            size: "HD Cover",
            type: "image",
            label: "Download Foto Cover Asli",
            directDownloadUrl: coverDownloadUrl,
            filename: `${safeTitle}_thumb.jpg`,
            safeTitle,
          },
        ],
      });
    }

    // 7. GENERIC PLATFORMS
    let genericTitle = "Social Media Content";
    let genericAuthor = "@creator";
    let genericThumb = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";

    try {
      const oembedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(rawUrl)}`);
      if (oembedRes.ok) {
        const odata = await oembedRes.json();
        if (odata.title) genericTitle = odata.title;
        if (odata.author_name) genericAuthor = odata.author_name;
        if (odata.thumbnail_url && isSafePublicUrl(odata.thumbnail_url)) genericThumb = odata.thumbnail_url;
      }
    } catch (e) {}

    const safeTitle = sanitizeFilename(genericTitle, `media_${Date.now()}`);
    const coverToken = encodeObfuscatedToken({
      url: genericThumb,
      filename: `${safeTitle}_cover.jpg`,
      type: "direct",
    });
    const coverDownloadUrl = `/api/media/download?token=${coverToken}`;

    return NextResponse.json({
      title: genericTitle,
      author: genericAuthor,
      thumbnail: genericThumb,
      platform: "universal",
      contentTypeLabel: "Universal Social Media Video",
      options: [
        {
          id: "gen_vid",
          quality: "Full HD Video (MP4)",
          format: "mp4",
          size: "Direct Stream",
          type: "video",
          label: "Download Video File",
          directDownloadUrl: `/downloads/${generateObfuscatedId("cly_gen")}.mp4`,
          filename: `${safeTitle}.mp4`,
          safeTitle,
          needsProcessing: true,
          cleanUrl: rawUrl,
        },
        {
          id: "gen_aud",
          quality: "Audio MP3",
          format: "mp3",
          size: "Audio File",
          type: "audio",
          label: "Download Audio Saja",
          directDownloadUrl: `/downloads/${generateObfuscatedId("cly_gen_aud")}.mp3`,
          filename: `${safeTitle}.mp3`,
          safeTitle,
          needsProcessing: true,
          cleanUrl: rawUrl,
        },
        {
          id: "gen_thumb",
          quality: "Cover Thumbnail (Direct Download)",
          format: "jpg",
          size: "Image HD",
          type: "image",
          label: "Download Foto Cover",
          directDownloadUrl: coverDownloadUrl,
          filename: `${safeTitle}_cover.jpg`,
          safeTitle,
        },
      ],
    });
  } catch (error: any) {
    console.error("API extract error:", error);
    return NextResponse.json(
      { error: "Gagal memproses tautan media. Pastikan link publik." },
      { status: 500 }
    );
  }
}

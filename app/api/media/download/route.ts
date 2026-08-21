import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { 
  isSafePublicUrl, 
  sanitizeFilename, 
  checkRateLimit, 
  decodeObfuscatedToken 
} from "@/lib/security";

const execFileAsync = promisify(execFile);

// Helper to extract direct stream URL via native yt-dlp binary
async function getDirectYtDlpStream(targetUrl: string, isAudio = false): Promise<string | null> {
  try {
    const formatArg = isAudio ? "bestaudio" : "bestvideo+bestaudio/best";
    const { stdout } = await execFileAsync("python", [
      "-m",
      "yt_dlp",
      "--no-playlist",
      "-g",
      "-f",
      formatArg,
      "--", // Argument injection shield
      targetUrl,
    ], {
      timeout: 15000,
    });
    const lines = stdout.trim().split("\n");
    const streamUrl = lines[0]?.trim();
    if (streamUrl && isSafePublicUrl(streamUrl)) {
      return streamUrl;
    }
    return null;
  } catch (err) {
    console.error("yt-dlp execution error:", err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  // 1. Rate limiting check
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const rateLimit = checkRateLimit(ip.split(",")[0].trim(), 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan unduhan. Silakan tunggu beberapa saat." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const tokenParam = searchParams.get("token");

  let type = searchParams.get("type"); // "youtube" | "direct"
  let urlParam = searchParams.get("url");
  let isAudio = searchParams.get("format") === "audio";
  let rawFilename = searchParams.get("filename") || (isAudio ? "clyra_audio.mp3" : "clyra_media.mp4");

  // 2. Decode Obfuscated Token if present
  if (tokenParam) {
    const decoded = decodeObfuscatedToken<{
      url?: string;
      type?: string;
      filename?: string;
      format?: string;
    }>(tokenParam);

    if (decoded) {
      if (decoded.url) urlParam = decoded.url;
      if (decoded.type) type = decoded.type;
      if (decoded.filename) rawFilename = decoded.filename;
      if (decoded.format === "audio") isAudio = true;
    }
  }

  // Sanitize filename & extension
  const extMatch = rawFilename.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : (isAudio ? "mp3" : "mp4");
  const baseNameWithoutExt = rawFilename.replace(/\.[^/.]+$/, "");
  const safeFilename = `${sanitizeFilename(baseNameWithoutExt, "clyra_download")}.${ext}`;

  // 3. SSRF Protection: Validate target URL
  if (!urlParam || !isSafePublicUrl(urlParam)) {
    return NextResponse.json(
      { error: "URL target tidak valid atau tidak diizinkan." },
      { status: 400 }
    );
  }

  // 4. IN-HOUSE DIRECT STREAM PIPE (Cover Images, Videos, Audio)
  if (urlParam && type !== "youtube") {
    try {
      const upstreamRes = await fetch(urlParam, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "*/*",
        },
      });

      if (upstreamRes.ok && upstreamRes.body) {
        let contentType = upstreamRes.headers.get("content-type") || "application/octet-stream";
        if (safeFilename.endsWith(".jpg") || safeFilename.endsWith(".jpeg")) {
          contentType = "image/jpeg";
        } else if (safeFilename.endsWith(".png")) {
          contentType = "image/png";
        } else if (safeFilename.endsWith(".mp3")) {
          contentType = "audio/mpeg";
        } else if (safeFilename.endsWith(".mp4")) {
          contentType = "video/mp4";
        }

        return new NextResponse(upstreamRes.body, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${safeFilename}"`,
            "Cache-Control": "public, max-age=3600",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
    } catch (e) {
      console.error("Stream pipe failed:", e);
      return NextResponse.redirect(urlParam);
    }
  }

  // 5. YOUTUBE DIRECT ENGINE
  if (type === "youtube" && urlParam) {
    const directStreamUrl = await getDirectYtDlpStream(urlParam, isAudio);
    if (directStreamUrl && isSafePublicUrl(directStreamUrl)) {
      return NextResponse.redirect(directStreamUrl);
    }
  }

  return NextResponse.json({ error: "Permintaan unduhan gagal diproses." }, { status: 500 });
}

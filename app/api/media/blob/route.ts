import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key || !/^[a-zA-Z0-9_\-]+$/.test(key)) {
      return NextResponse.json({ error: "Kunci file tidak valid." }, { status: 400 });
    }

    const downloadsDir = path.resolve(process.cwd(), "public", "downloads");
    const mp3Path = path.join(downloadsDir, `${key}.mp3`);
    const mp4Path = path.join(downloadsDir, `${key}.mp4`);

    let targetFile = "";
    if (fs.existsSync(mp3Path)) {
      targetFile = mp3Path;
    } else if (fs.existsSync(mp4Path)) {
      targetFile = mp4Path;
    } else {
      return NextResponse.json({ error: "File tidak ditemukan di server." }, { status: 404 });
    }

    // Path traversal defense check
    if (!targetFile.startsWith(downloadsDir)) {
      return NextResponse.json({ error: "Akses file dilarang." }, { status: 403 });
    }

    const fileBuffer = fs.readFileSync(targetFile);

    // Return as raw octet-stream with no attachment trigger and no audio extension in URL.
    // This allows browser JS to read binary blobs into memory for ZIP packaging
    // without third-party download managers (like IDM) intercepting the individual files.
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

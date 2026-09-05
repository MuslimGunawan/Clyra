/**
 * Clyra Spotify Metadata Extractor & Track Resolver
 * Parses Tracks, Playlists, Albums, and Artists using Spotify's open oEmbed & Embed API.
 * Provides high-res cover art, tracklists, 30s preview audio, and metadata matching queries.
 */

export interface SpotifyTrack {
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

export interface SpotifyResult {
  title: string;
  author: string;
  thumbnail: string;
  platform: "spotify";
  contentTypeLabel: string;
  spotifyType: "track" | "playlist" | "album" | "artist";
  totalTracks: number;
  tracks: SpotifyTrack[];
}

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function isSpotifyUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.toLowerCase().trim();
  return clean.includes("spotify.com") || clean.includes("spotify.link");
}

export async function extractSpotifyData(rawUrl: string): Promise<SpotifyResult | null> {
  try {
    const cleanUrl = rawUrl.trim();
    // Matches open.spotify.com/[intl-xx/](track|playlist|album|artist)/ID
    const match = cleanUrl.match(
      /open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|playlist|album|artist)\/([a-zA-Z0-9]+)/i
    );

    if (!match) {
      return null;
    }

    const [, typeStr, id] = match;
    const type = typeStr.toLowerCase() as "track" | "playlist" | "album" | "artist";
    const oembedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${id}`;
    const embedUrl = `https://open.spotify.com/embed/${type}/${id}`;

    let oembedTitle = "";
    let oembedThumb = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop";

    // 1. Fetch oEmbed for High Quality Thumbnail & Official Title
    try {
      const oRes = await fetch(oembedUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      });
      if (oRes.ok) {
        const oData = await oRes.json();
        if (oData.title) oembedTitle = oData.title;
        if (oData.thumbnail_url) oembedThumb = oData.thumbnail_url;
      }
    } catch (e) {
      console.error("Spotify oEmbed error:", e);
    }

    // 2. Fetch Embed HTML to parse __NEXT_DATA__
    const embedRes = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!embedRes.ok) {
      // Fallback if embed is blocked
      return {
        title: oembedTitle || `Spotify ${type.toUpperCase()}`,
        author: "Spotify Creator",
        thumbnail: oembedThumb,
        platform: "spotify",
        contentTypeLabel: `Spotify ${type === "playlist" ? "Playlist" : type === "album" ? "Album" : "Lagu"}`,
        spotifyType: type,
        totalTracks: 1,
        tracks: [
          {
            id: `spot_${id}`,
            trackNumber: 1,
            title: oembedTitle || "Spotify Track",
            artist: "Spotify Artist",
            durationFormatted: "--:--",
            durationMs: 0,
            previewUrl: null,
            query: oembedTitle,
            uri: `spotify:${type}:${id}`,
          },
        ],
      };
    }

    const html = await embedRes.text();
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);

    if (!nextDataMatch) {
      return null;
    }

    const json = JSON.parse(nextDataMatch[1]);
    const entity = json.props?.pageProps?.state?.data?.entity;

    if (!entity) {
      return null;
    }

    const finalTitle = entity.name || oembedTitle || `Spotify ${type.toUpperCase()}`;
    const artistName =
      entity.subtitle ||
      (entity.artists ? entity.artists.map((a: any) => a.name).join(", ") : "") ||
      "Spotify Artist";

    let tracks: SpotifyTrack[] = [];

    if (type === "track") {
      // Single Track
      const trackDuration = entity.duration || 0;
      tracks.push({
        id: `track_${id}`,
        trackNumber: 1,
        title: finalTitle,
        artist: artistName,
        durationFormatted: formatDuration(trackDuration),
        durationMs: trackDuration,
        previewUrl: entity.audioPreview?.url || null,
        query: `${artistName} - ${finalTitle} Official Audio`,
        uri: entity.uri || `spotify:track:${id}`,
      });
    } else if (entity.trackList && Array.isArray(entity.trackList)) {
      // Playlist or Album with trackList
      tracks = entity.trackList.map((t: any, idx: number) => {
        const tTitle = t.title || t.name || `Lagu #${idx + 1}`;
        const tArtist = t.subtitle || artistName || "Various Artists";
        const tDuration = t.duration || 0;
        const trackId = t.uri ? t.uri.replace("spotify:track:", "") : `${idx + 1}`;

        return {
          id: `track_${trackId}_${idx}`,
          trackNumber: idx + 1,
          title: tTitle,
          artist: tArtist,
          durationFormatted: formatDuration(tDuration),
          durationMs: tDuration,
          previewUrl: t.audioPreview?.url || null,
          query: `${tArtist} - ${tTitle} Official Audio`,
          uri: t.uri || `spotify:track:${trackId}`,
        };
      });
    }

    const contentTypeLabel =
      type === "playlist"
        ? `Spotify Playlist (${tracks.length} Lagu)`
        : type === "album"
        ? `Spotify Album (${tracks.length} Lagu)`
        : type === "artist"
        ? `Spotify Artist Profile (${tracks.length} Lagu)`
        : "Spotify Lagu (MP3 320kbps)";

    return {
      title: finalTitle,
      author: artistName,
      thumbnail: oembedThumb,
      platform: "spotify",
      contentTypeLabel,
      spotifyType: type,
      totalTracks: tracks.length,
      tracks,
    };
  } catch (error) {
    console.error("extractSpotifyData exception:", error);
    return null;
  }
}

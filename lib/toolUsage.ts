import { ToolItem } from "./types";

const USAGE_STORAGE_KEY = "clyra_tool_usage";
const PINNED_STORAGE_KEY = "clyra_pinned_tools";
const RECENT_STORAGE_KEY = "clyra_recent_tools";

// Default initial usage scores for first-time visitors
const DEFAULT_INITIAL_SCORES: Record<string, number> = {
  "image-compressor": 150,
  "text-case-converter": 120,
  "image-converter": 110,
  "json-formatter": 95,
  "base64-codec": 85,
  "qr-generator": 80,
  "color-palette": 75,
  "hash-generator": 70,
  "svg-converter": 65,
  "markdown-previewer": 60,
};

export function getToolUsageMap(): Record<string, number> {
  if (typeof window === "undefined") return DEFAULT_INITIAL_SCORES;
  try {
    const data = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!data) return DEFAULT_INITIAL_SCORES;
    const userScores = JSON.parse(data);
    return { ...DEFAULT_INITIAL_SCORES, ...userScores };
  } catch (e) {
    return DEFAULT_INITIAL_SCORES;
  }
}

export function recordToolUsage(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getToolUsageMap();
    const newScore = (current[slug] || 0) + 1;
    const updated = { ...current, [slug]: newScore };
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(updated));

    // Also track in recent history
    const recent = getRecentTools();
    const updatedRecent = [slug, ...recent.filter((s) => s !== slug)].slice(0, 5);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updatedRecent));
  } catch (e) {
    console.error(e);
  }
}

export function getPinnedTools(): string[] {
  if (typeof window === "undefined") return ["image-compressor", "text-case-converter"];
  try {
    const data = localStorage.getItem(PINNED_STORAGE_KEY);
    return data ? JSON.parse(data) : ["image-compressor", "text-case-converter"];
  } catch (e) {
    return ["image-compressor", "text-case-converter"];
  }
}

export function togglePinTool(slug: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getPinnedTools();
    const isPinned = current.includes(slug);
    const updated = isPinned ? current.filter((s) => s !== slug) : [...current, slug];
    localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function getRecentTools(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(RECENT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function sortToolsByUsage(tools: ToolItem[], sortMode: "usage" | "popular" | "alpha" | "newest" = "usage"): ToolItem[] {
  const usageMap = getToolUsageMap();
  const list = [...tools];

  if (sortMode === "usage") {
    return list.sort((a, b) => (usageMap[b.slug] || 0) - (usageMap[a.slug] || 0));
  } else if (sortMode === "alpha") {
    return list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // default curated order
    return list;
  }
}

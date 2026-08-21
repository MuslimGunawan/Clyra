export type ToolCategory = "converter" | "formatter" | "generator" | "security" | "media" | "developer";

export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  status: "ready" | "coming_soon" | "beta";
  badge?: string;
  code?: string;
  tags: string[];
}

export interface PromptItem {
  id: string;
  title: string;
  description: string;
  prompt: string;
  negativePrompt?: string;
  thumbnail: string;
  aiModel: string; // e.g. "Midjourney v6", "DALL-E 3", "Stable Diffusion", "Claude 3.5 Sonnet", "ChatGPT"
  category: "3D & Render" | "Photography" | "Anime & Art" | "UI & Graphic" | "Coding & Logic" | "Writing";
  tags: string[];
  parameters?: {
    aspectRatio?: string;
    stylize?: string;
    seed?: string;
    chaos?: string;
  };
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: "Web App" | "Landing Page" | "Tool" | "Open Source" | "Client Project";
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  year: string;
}

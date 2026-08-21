import { PromptItem } from "@/lib/types";

export const PROMPTS: PromptItem[] = [
  {
    id: "prompt-cyberpunk-workspace",
    title: "Cyberpunk Developer Workspace 3D",
    description: "Desain isometric 3D workspace bernuansa cyberpunk neon gelap dengan multi-monitor ultra-wide, ambient glow ungu-cyan, dan glass panel.",
    prompt: "Isometric 3D render of a futuristic cyberpunk software engineer workstation, multi-monitor curved setup displaying matrix code and neural graphs, dark ambient lighting, subtle cyan and ultraviolet neon strips, transparent holographic floating panels, matte black aesthetic, Octane render, 8k resolution, photorealistic cinematic lighting, ray tracing --ar 16:9 --style raw --v 6.0",
    negativePrompt: "bright daylight, low resolution, blurry, oversaturated yellow, cartoony, low poly, watermark",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
    aiModel: "Midjourney v6",
    category: "3D & Render",
    tags: ["Cyberpunk", "Isometric", "Workspace", "3D", "Dark Theme"],
    parameters: {
      aspectRatio: "16:9",
      stylize: "250",
      chaos: "10"
    },
    createdAt: "2026-08-10"
  },
  {
    id: "prompt-minimalist-abstract-fluid",
    title: "Dark Minimalist Fluid Hologram",
    description: "Visualisasi fluida abstrak hitam pekat dan gradasi iridescence prismatik untuk background hero landing page premium.",
    prompt: "Aesthetic abstract dark liquid chrome ribbon floating in pitch black void, subtle iridescent edges shifting from deep violet to obsidian teal, hyper-detailed reflections, cinematic studio lighting, minimalist composition, wallpaper quality, 8k, Unreal Engine 5 render style --ar 16:9 --v 6.0",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    aiModel: "Midjourney v6",
    category: "UI & Graphic",
    tags: ["Abstract", "Fluid", "Iridescent", "Minimalist", "Hero Background"],
    parameters: {
      aspectRatio: "16:9",
      stylize: "400"
    },
    createdAt: "2026-08-12"
  },
  {
    id: "prompt-sleek-fintech-dashboard",
    title: "Sleek Dark Glassmorphism UI Concept",
    description: "Konsep UI dashboard analitik dark mode ultra-modern dengan glassmorphic widgets, sparkline chart glowing, dan typography tajam.",
    prompt: "High-fidelity modern dark mode financial analytics dashboard UI design, sleek charcoal background (#0B0F17), frosted glass cards with 1px border glow, glowing neon emerald green and sapphire blue data visualization charts, clean typography, minimalist navigation sidebar, Behance and Dribbble trending, Figma vector style --ar 16:10",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    aiModel: "DALL-E 3",
    category: "UI & Graphic",
    tags: ["UI/UX", "Dashboard", "Glassmorphism", "Dark Mode", "Fintech"],
    parameters: {
      aspectRatio: "16:10"
    },
    createdAt: "2026-08-14"
  },
  {
    id: "prompt-architectural-brutalist-sanctuary",
    title: "Monolithic Architectural Interior",
    description: "Ruang arsitektur brutalist modern dengan dinding beton gelap, pencahayaan skylight lembut, dan kolam refleksi air.",
    prompt: "Modern brutalist zen sanctuary interior, dark raw textured concrete walls, minimalist sunken living lounge, floor-to-ceiling glass looking out to mist-covered pine forest, calm reflection indoor water basin, gentle dramatic morning sunlight rays, architectural photography, Hasselblad H6D-100c, sharp focus --ar 16:9",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    aiModel: "Midjourney v6",
    category: "Photography",
    tags: ["Architecture", "Brutalism", "Interior", "Minimalist", "Moody"],
    parameters: {
      aspectRatio: "16:9",
      stylize: "150"
    },
    createdAt: "2026-08-16"
  },
  {
    id: "prompt-system-prompt-architect",
    title: "Senior Fullstack System Architect Prompt",
    description: "System prompt teruji untuk AI LLM (Claude / GPT) agar memberikan arsitektur kode clean architecture, scalable, dan type-safe.",
    prompt: "You are an elite Staff Software Architect specializing in Next.js 16 App Router, TypeScript 5, and scalable cloud-native architectures. When asked to design or write code, always provide: 1. Strict TypeScript interfaces with zero `any` types. 2. Clean separation of concerns (presentation, business logic, data fetching). 3. Optimal performance and zero bundle bloat. 4. Clear step-by-step implementation guide with atomic diffs.",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    aiModel: "Claude 3.5 Sonnet",
    category: "Coding & Logic",
    tags: ["System Prompt", "Architecture", "TypeScript", "Next.js", "AI Assistant"],
    createdAt: "2026-08-17"
  }
];

export const PROMPT_CATEGORIES = [
  "Semua Kategori",
  "UI & Graphic",
  "3D & Render",
  "Photography",
  "Coding & Logic",
  "Anime & Art",
  "Writing"
];

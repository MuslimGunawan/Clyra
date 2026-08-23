import { ProjectItem } from "@/lib/types";

export const PROJECTS: ProjectItem[] = [
  {
    "id": "clyra-hub",
    "title": "Clyra Platform",
    "description": "Personal tools workspace, AI prompt library, dan portofolio gallery serbaguna dengan dark aesthetic modern dan performa tinggi.",
    "thumbnail": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
    "category": "Web App",
    "techStack": [
      "Next.js 16",
      "TypeScript",
      "Tailwind CSS v4",
      "Lucide Icons",
      "Vercel"
    ],
    "liveUrl": "https://clyra.vercel.app",
    "githubUrl": "https://github.com",
    "featured": true,
    "year": "2026"
  },
  {
    "id": "zenith-landing",
    "title": "Zenith SaaS Landing Engine",
    "description": "Landing page SaaS bernuansa modern minimalis dengan interactive pricing calculator, dynamic testimonials, dan responsive dark mode.",
    "thumbnail": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    "category": "Landing Page",
    "techStack": [
      "React",
      "Tailwind CSS",
      "Framer Motion",
      "Vite"
    ],
    "liveUrl": "https://example.com",
    "githubUrl": "https://github.com",
    "featured": true,
    "year": "2025"
  },
  {
    "id": "pulse-analytics",
    "title": "Pulse Real-time Analytics",
    "description": "Dashboard pemantau metrik website dan server realtime dengan interactive charts, telemetry visualizer, dan alert manager.",
    "thumbnail": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    "category": "Web App",
    "techStack": [
      "Next.js",
      "Node.js",
      "ChartJS",
      "PostgreSQL"
    ],
    "liveUrl": "https://example.com",
    "githubUrl": "https://github.com",
    "featured": false,
    "year": "2025"
  },
  {
    "id": "aura-component-kit",
    "title": "Aura UI Design System",
    "description": "Koleksi komponen UI dark-mode elegan yang accessible, lightweight, dan copy-paste friendly untuk Next.js dan Tailwind.",
    "thumbnail": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1200&auto=format&fit=crop",
    "category": "Open Source",
    "techStack": [
      "TypeScript",
      "Tailwind CSS",
      "React",
      "Radix Primitives"
    ],
    "liveUrl": "https://example.com",
    "githubUrl": "https://github.com",
    "featured": false,
    "year": "2025"
  }
];

export const PROJECT_CATEGORIES = [
  "Semua Kategori",
  "Web App",
  "Landing Page",
  "Tool",
  "Open Source",
  "Client Project"
];

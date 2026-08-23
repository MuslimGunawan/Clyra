import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPasswordOnly } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passkey, prompts, projects } = body;

    // 1. Authenticate Request
    if (!passkey || !verifyAdminPasswordOnly(passkey)) {
      return NextResponse.json(
        { success: false, error: "Otorisasi ditolak. Master key admin tidak valid." },
        { status: 401 }
      );
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER || "MuslimGunawan";
    const repo = process.env.GITHUB_REPO_NAME || "Clyra";
    const branch = process.env.GITHUB_BRANCH || "main";

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: "GITHUB_TOKEN belum dikonfigurasi di Environment Variables server." 
        },
        { status: 500 }
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Clyra-Vault-Sync",
    };

    // 2. Format TS Code for data/prompts.ts
    const promptsTsCode = `import { PromptItem } from "@/lib/types";

export const PROMPTS: PromptItem[] = ${JSON.stringify(prompts || [], null, 2)};

export const PROMPT_CATEGORIES = [
  "Semua Kategori",
  "Photography",
  "UI & Graphic",
  "3D & Render",
  "Coding & Logic",
  "Anime & Art",
  "Writing"
];
`;

    // 3. Format TS Code for data/projects.ts
    const projectsTsCode = `import { ProjectItem } from "@/lib/types";

export const PROJECTS: ProjectItem[] = ${JSON.stringify(projects || [], null, 2)};

export const PROJECT_CATEGORIES = [
  "Semua Kategori",
  "Web App",
  "Landing Page",
  "Tool",
  "Open Source",
  "Client Project"
];
`;

    // 4. Update data/prompts.ts on GitHub
    const promptsPath = "data/prompts.ts";
    const promptsUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${promptsPath}`;

    // Get current SHA for prompts.ts
    let promptsSha: string | undefined;
    const promptsGetRes = await fetch(`${promptsUrl}?ref=${branch}`, { headers, cache: "no-store" });
    if (promptsGetRes.ok) {
      const promptsData = await promptsGetRes.json();
      promptsSha = promptsData.sha;
    }

    // Commit prompts.ts
    const promptsPutRes = await fetch(promptsUrl, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "chore(vault): auto-sync AI Prompts from Clyra Admin",
        content: Buffer.from(promptsTsCode, "utf-8").toString("base64"),
        sha: promptsSha,
        branch,
      }),
    });

    if (!promptsPutRes.ok) {
      const errorData = await promptsPutRes.json();
      return NextResponse.json(
        { 
          success: false, 
          error: `Gagal commit data/prompts.ts ke GitHub: ${errorData.message || promptsPutRes.statusText}` 
        },
        { status: 500 }
      );
    }

    // 5. Update data/projects.ts on GitHub
    const projectsPath = "data/projects.ts";
    const projectsUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${projectsPath}`;

    // Get current SHA for projects.ts
    let projectsSha: string | undefined;
    const projectsGetRes = await fetch(`${projectsUrl}?ref=${branch}`, { headers, cache: "no-store" });
    if (projectsGetRes.ok) {
      const projectsData = await projectsGetRes.json();
      projectsSha = projectsData.sha;
    }

    // Commit projects.ts
    const projectsPutRes = await fetch(projectsUrl, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "chore(vault): auto-sync Web Projects from Clyra Admin (triggers Vercel live deploy)",
        content: Buffer.from(projectsTsCode, "utf-8").toString("base64"),
        sha: projectsSha,
        branch,
      }),
    });

    if (!projectsPutRes.ok) {
      const errorData = await projectsPutRes.json();
      return NextResponse.json(
        { 
          success: false, 
          error: `Gagal commit data/projects.ts ke GitHub: ${errorData.message || projectsPutRes.statusText}` 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sukses! Data telah di-commit & di-push ke GitHub Repo. Vercel otomatis mendeploy versi terbaru dalam beberapa detik.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Internal Error: ${error.message || "Gagal sinkronisasi ke GitHub"}` },
      { status: 500 }
    );
  }
}

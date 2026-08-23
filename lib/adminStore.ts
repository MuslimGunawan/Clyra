/**
 * Clyra Centralized Data Store & CRUD Manager for AI Prompts & Web Works
 */

import { PROMPTS } from "@/data/prompts";
import { PROJECTS } from "@/data/projects";
import { PromptItem, ProjectItem } from "./types";

const PROMPTS_VAULT_KEY = "clyra_prompts_vault_v1";
const PROJECTS_VAULT_KEY = "clyra_projects_vault_v1";

/**
 * AI PROMPTS CRUD OPERATIONS
 */
export function getStoredPrompts(): PromptItem[] {
  if (typeof window === "undefined") return PROMPTS;
  try {
    const raw = localStorage.getItem(PROMPTS_VAULT_KEY);
    if (!raw) {
      localStorage.setItem(PROMPTS_VAULT_KEY, JSON.stringify(PROMPTS));
      return PROMPTS;
    }
    const stored: PromptItem[] = JSON.parse(raw);
    
    // Auto-sync: Ensure any new default prompts from data/prompts.ts are automatically added if missing
    const storedIds = new Set(stored.map((p) => p.id));
    const missingDefaults = PROMPTS.filter((p) => !storedIds.has(p.id));
    if (missingDefaults.length > 0) {
      const merged = [...missingDefaults, ...stored];
      localStorage.setItem(PROMPTS_VAULT_KEY, JSON.stringify(merged));
      return merged;
    }
    return stored;
  } catch {
    return PROMPTS;
  }
}

export function saveStoredPrompt(prompt: PromptItem): PromptItem[] {
  if (typeof window === "undefined") return PROMPTS;
  try {
    const current = getStoredPrompts();
    const existingIndex = current.findIndex((p) => p.id === prompt.id);
    let updated: PromptItem[];

    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = prompt;
    } else {
      updated = [prompt, ...current];
    }

    localStorage.setItem(PROMPTS_VAULT_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("clyra_prompts_updated"));
    return updated;
  } catch {
    return PROMPTS;
  }
}

export function deleteStoredPrompt(id: string): PromptItem[] {
  if (typeof window === "undefined") return PROMPTS;
  try {
    const current = getStoredPrompts();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(PROMPTS_VAULT_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("clyra_prompts_updated"));
    return updated;
  } catch {
    return PROMPTS;
  }
}

export function resetPromptsToDefault(): PromptItem[] {
  if (typeof window === "undefined") return PROMPTS;
  try {
    localStorage.setItem(PROMPTS_VAULT_KEY, JSON.stringify(PROMPTS));
    window.dispatchEvent(new Event("clyra_prompts_updated"));
    return PROMPTS;
  } catch {
    return PROMPTS;
  }
}

/**
 * WEB WORKS (PROJECTS) CRUD OPERATIONS
 */
export function getStoredProjects(): ProjectItem[] {
  if (typeof window === "undefined") return PROJECTS;
  try {
    const raw = localStorage.getItem(PROJECTS_VAULT_KEY);
    if (!raw) {
      localStorage.setItem(PROJECTS_VAULT_KEY, JSON.stringify(PROJECTS));
      return PROJECTS;
    }
    return JSON.parse(raw);
  } catch {
    return PROJECTS;
  }
}

export function saveStoredProject(project: ProjectItem): ProjectItem[] {
  if (typeof window === "undefined") return PROJECTS;
  try {
    const current = getStoredProjects();
    const existingIndex = current.findIndex((p) => p.id === project.id);
    let updated: ProjectItem[];

    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = project;
    } else {
      updated = [project, ...current];
    }

    localStorage.setItem(PROJECTS_VAULT_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("clyra_projects_updated"));
    return updated;
  } catch {
    return PROJECTS;
  }
}

export function deleteStoredProject(id: string): ProjectItem[] {
  if (typeof window === "undefined") return PROJECTS;
  try {
    const current = getStoredProjects();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(PROJECTS_VAULT_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("clyra_projects_updated"));
    return updated;
  } catch {
    return PROJECTS;
  }
}

export function resetProjectsToDefault(): ProjectItem[] {
  if (typeof window === "undefined") return PROJECTS;
  try {
    localStorage.setItem(PROJECTS_VAULT_KEY, JSON.stringify(PROJECTS));
    window.dispatchEvent(new Event("clyra_projects_updated"));
    return PROJECTS;
  } catch {
    return PROJECTS;
  }
}

/**
 * BACKUP & RESTORE EXPORT / IMPORT
 */
export function exportVaultBackup(): string {
  const data = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    prompts: getStoredPrompts(),
    projects: getStoredProjects(),
  };
  return JSON.stringify(data, null, 2);
}

export function importVaultBackup(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.prompts || !data.projects || !Array.isArray(data.prompts) || !Array.isArray(data.projects)) {
      return { success: false, message: "Format file JSON cadangan tidak valid." };
    }

    localStorage.setItem(PROMPTS_VAULT_KEY, JSON.stringify(data.prompts));
    localStorage.setItem(PROJECTS_VAULT_KEY, JSON.stringify(data.projects));

    window.dispatchEvent(new Event("clyra_prompts_updated"));
    window.dispatchEvent(new Event("clyra_projects_updated"));

    return {
      success: true,
      message: `Berhasil memulihkan ${data.prompts.length} Prompts & ${data.projects.length} Projek Web!`,
    };
  } catch (err: any) {
    return { success: false, message: `Gagal membaca file JSON: ${err.message}` };
  }
}

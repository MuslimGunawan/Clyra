/**
 * Clyra Centralized Data Store & CRUD Manager for AI Prompts & Web Works
 */

import { PROMPTS } from "@/data/prompts";
import { PROJECTS } from "@/data/projects";
import { PromptItem, ProjectItem } from "./types";

const PROMPTS_VAULT_KEY = "clyra_prompts_vault_v1";
const PROMPTS_DELETED_KEY = "clyra_prompts_deleted_ids_v1";

const PROJECTS_VAULT_KEY = "clyra_projects_vault_v1";
const PROJECTS_DELETED_KEY = "clyra_projects_deleted_ids_v1";

function getDeletedPromptIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PROMPTS_DELETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addDeletedPromptId(id: string) {
  if (typeof window === "undefined") return;
  try {
    const deleted = getDeletedPromptIds();
    deleted.add(id);
    localStorage.setItem(PROMPTS_DELETED_KEY, JSON.stringify(Array.from(deleted)));
  } catch {}
}

function getDeletedProjectIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PROJECTS_DELETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addDeletedProjectId(id: string) {
  if (typeof window === "undefined") return;
  try {
    const deleted = getDeletedProjectIds();
    deleted.add(id);
    localStorage.setItem(PROJECTS_DELETED_KEY, JSON.stringify(Array.from(deleted)));
  } catch {}
}

/**
 * AI PROMPTS CRUD OPERATIONS
 */
export function getStoredPrompts(): PromptItem[] {
  if (typeof window === "undefined") return PROMPTS;
  try {
    const raw = localStorage.getItem(PROMPTS_VAULT_KEY);
    const deletedIds = getDeletedPromptIds();

    if (!raw) {
      // Filter out any previously deleted IDs
      const initial = PROMPTS.filter((p) => !deletedIds.has(p.id));
      localStorage.setItem(PROMPTS_VAULT_KEY, JSON.stringify(initial));
      return initial;
    }

    const stored: PromptItem[] = JSON.parse(raw);
    const storedIds = new Set(stored.map((p) => p.id));

    // Auto-sync: Only add new default prompts that have NEVER been explicitly deleted by the user
    const missingDefaults = PROMPTS.filter(
      (p) => !storedIds.has(p.id) && !deletedIds.has(p.id)
    );

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
    addDeletedPromptId(id);
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
    localStorage.removeItem(PROMPTS_DELETED_KEY);
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
    const deletedIds = getDeletedProjectIds();

    if (!raw) {
      const initial = PROJECTS.filter((p) => !deletedIds.has(p.id));
      localStorage.setItem(PROJECTS_VAULT_KEY, JSON.stringify(initial));
      return initial;
    }

    const stored: ProjectItem[] = JSON.parse(raw);
    const storedIds = new Set(stored.map((p) => p.id));

    // Auto-sync: Only add new default projects that have NEVER been explicitly deleted
    const missingDefaults = PROJECTS.filter(
      (p) => !storedIds.has(p.id) && !deletedIds.has(p.id)
    );

    if (missingDefaults.length > 0) {
      const merged = [...missingDefaults, ...stored];
      localStorage.setItem(PROJECTS_VAULT_KEY, JSON.stringify(merged));
      return merged;
    }

    return stored;
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
    addDeletedProjectId(id);
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
    localStorage.removeItem(PROJECTS_DELETED_KEY);
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

    // Clear deleted IDs on manual full restore
    localStorage.removeItem(PROMPTS_DELETED_KEY);
    localStorage.removeItem(PROJECTS_DELETED_KEY);

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

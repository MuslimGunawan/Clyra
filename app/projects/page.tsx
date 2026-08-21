"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, FolderGit2, ArrowRight } from "lucide-react";
import { PROMPTS } from "@/data/prompts";
import { PROJECTS } from "@/data/projects";
import PromptCard from "@/components/PromptCard";
import ProjectCard from "@/components/ProjectCard";
import PromptModal from "@/components/PromptModal";
import { PromptItem } from "@/lib/types";

export default function ProjectsHubPage() {
  const [activeTab, setActiveTab] = useState<"prompts" | "web">("prompts");
  const [activeModalPrompt, setActiveModalPrompt] = useState<PromptItem | null>(null);

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col">
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Projects & Showcase</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Koleksi & Eksperimen
            </h1>
            <p className="mt-1.5 text-sm text-slate-400 max-w-xl">
              Galeri prompt AI siap pakai dengan thumbnail preview serta portofolio karya web yang pernah dibuat.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#0e111a] p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("prompts")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "prompts"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Prompts ({PROMPTS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("web")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "web"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Web Works ({PROJECTS.length})</span>
            </button>
          </div>
        </div>

        {/* Content Render based on active tab */}
        {activeTab === "prompts" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Menampilkan Prompt AI Terpilih
              </span>
              <Link
                href="/projects/prompts"
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium group"
              >
                <span>Lihat Semua Prompt & Filter Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROMPTS.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onOpenModal={(p) => setActiveModalPrompt(p)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Menampilkan Karya Web & Aplikasi
              </span>
              <Link
                href="/projects/web"
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium group"
              >
                <span>Lihat Semua Projek & Filter</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROJECTS.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
      </main>

      <PromptModal
        prompt={activeModalPrompt}
        onClose={() => setActiveModalPrompt(null)}
      />
    </div>
  );
}

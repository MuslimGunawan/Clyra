"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  FolderGit2 
} from "lucide-react";
import { PROJECTS, PROJECT_CATEGORIES } from "@/data/projects";
import { ProjectItem } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";
import { getStoredProjects } from "@/lib/adminStore";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function WebProjectsPage() {
  const { t } = useLanguage();
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(PROJECTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua Projek");

  const loadData = () => {
    setProjectsList(getStoredProjects());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("clyra_projects_updated", handleUpdate);
    return () => window.removeEventListener("clyra_projects_updated", handleUpdate);
  }, []);

  const filteredProjects = useMemo(() => {
    return projectsList.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.techStack.some((tech) =>
          tech.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "Semua Projek" ||
        item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [projectsList, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col">
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-4">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>{t("web.page_badge")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {t("web.page_title")}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 leading-relaxed">
              {t("web.page_desc")}
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#0e111a] border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-8 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari projek atau teknologi..."
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 w-full">
              {PROJECT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                      : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((item) => (
              <ProjectCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#0e111a] border border-slate-800/80 rounded-2xl">
            <p className="text-slate-400 text-sm">
              Tidak ada projek yang cocok dengan filter atau pencarian Anda.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Semua Projek");
              }}
              className="mt-3 text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              Reset filter
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

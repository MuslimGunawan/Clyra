"use client";

import { ExternalLink, Code2 } from "lucide-react";
import { ProjectItem } from "@/lib/types";
import { sanitizeSafeUrl } from "@/lib/security";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProjectCardProps {
  item?: ProjectItem;
  project?: ProjectItem;
}

export default function ProjectCard({ item, project }: ProjectCardProps) {
  const currentProject = item || project!;
  const { t } = useLanguage();

  return (
    <div className="group relative flex flex-col bg-[#0f111a]/80 hover:bg-[#131724] border border-slate-800/80 hover:border-indigo-500/40 rounded-xl overflow-hidden transition-all duration-300 shadow-lg">
      {/* Thumbnail with overlay */}
      <div className="relative w-full h-48 sm:h-52 bg-slate-900 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentProject.thumbnail}
          alt={currentProject.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/20 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 backdrop-blur-md">
            {currentProject.category}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 bg-black/60 border border-slate-700 backdrop-blur-md">
            {currentProject.year}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors text-base">
            {currentProject.title}
          </h4>
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {currentProject.description}
          </p>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1.5">
          {currentProject.techStack.map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Links */}
        <div className="pt-3 border-t border-slate-800/60 flex items-center gap-3">
          {sanitizeSafeUrl(currentProject.liveUrl) && (
            <a
              href={sanitizeSafeUrl(currentProject.liveUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span>{t("web.visit_btn")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {sanitizeSafeUrl(currentProject.githubUrl) && (
            <a
              href={sanitizeSafeUrl(currentProject.githubUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
              title="Lihat Repository Source Code"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("web.source_btn")}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

import DynamicLink from "@/components/DynamicLink";
import { Scale, Terminal } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/60 bg-[#06070a]/90 text-slate-400 text-xs py-10 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 tracking-tight">Clyra</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Personal Workspace &amp; Tool Hub</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Dirancang minimalis, efisien, 100% Client-side safe &amp; terenkripsi.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
          <DynamicLink href="/tools" className="hover:text-indigo-400 transition-colors">
            Semua Tools
          </DynamicLink>
          <DynamicLink href="/projects/prompts" className="hover:text-indigo-400 transition-colors">
            AI Prompts
          </DynamicLink>
          <DynamicLink href="/projects/web" className="hover:text-indigo-400 transition-colors">
            Web Works
          </DynamicLink>
          <DynamicLink href="/terms" className="text-slate-500 hover:text-indigo-300 transition-colors flex items-center gap-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Syarat &amp; Disclaimer</span>
          </DynamicLink>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Crafted for high productivity</span>
        </div>
      </div>
    </footer>
  );
}

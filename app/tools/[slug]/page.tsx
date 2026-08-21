import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, Wrench, ShieldCheck } from "lucide-react";
import { TOOLS } from "@/data/tools";
import { IconHelper } from "@/components/IconHelper";
import TextCaseConverter from "@/components/tools/TextCaseConverter";
import Base64Codec from "@/components/tools/Base64Codec";
import ImageCompressor from "@/components/tools/ImageCompressor";
import ImageConverter from "@/components/tools/ImageConverter";
import JsonFormatter from "@/components/tools/JsonFormatter";
import ColorStudio from "@/components/tools/ColorStudio";
import HashPasswordGenerator from "@/components/tools/HashPasswordGenerator";
import MarkdownEditor from "@/components/tools/MarkdownEditor";
import SvgConverter from "@/components/tools/SvgConverter";
import QrGenerator from "@/components/tools/QrGenerator";
import MediaDownloader from "@/components/tools/MediaDownloader";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-indigo-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Direktori Tools</span>
          </Link>
        </div>

        {/* Header Information */}
        <div className="bg-[#0c0e17] border border-slate-800/80 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <IconHelper name={tool.iconName} className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {tool.category}
                  </span>
                  {tool.badge && (
                    <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {tool.name}
                </h1>
                <p className="mt-1 text-sm text-slate-400 max-w-2xl leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>

            {/* Privacy & Safety badge */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs text-slate-400 shrink-0">
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-2.5 py-1 rounded-full font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Client-side Safe</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Zero Server Storage</span>
            </div>
          </div>
        </div>

        {/* Tool Implementation Container */}
        <div>
          {slug === "media-downloader" && <MediaDownloader />}
          {slug === "text-case-converter" && <TextCaseConverter />}
          {slug === "base64-codec" && <Base64Codec />}
          {slug === "image-compressor" && <ImageCompressor />}
          {slug === "image-converter" && <ImageConverter />}
          {slug === "json-formatter" && <JsonFormatter />}
          {slug === "color-palette" && <ColorStudio />}
          {slug === "hash-generator" && <HashPasswordGenerator />}
          {slug === "markdown-previewer" && <MarkdownEditor />}
          {slug === "svg-converter" && <SvgConverter />}
          {slug === "qr-generator" && <QrGenerator />}
        </div>
      </main>
    </div>
  );
}

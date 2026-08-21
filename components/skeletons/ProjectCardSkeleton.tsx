export default function ProjectCardSkeleton() {
  return (
    <div className="relative flex flex-col bg-[#0f111a]/80 border border-slate-800/80 rounded-xl overflow-hidden shadow-lg animate-pulse backdrop-blur-sm">
      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />

      {/* Thumbnail area */}
      <div className="w-full h-48 sm:h-52 bg-slate-900/90 relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-slate-800/60" />
        <div className="absolute top-3 left-3 w-20 h-5 rounded bg-slate-800/80" />
        <div className="absolute top-3 right-3 w-12 h-5 rounded bg-slate-800/80" />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="w-2/3 h-5 rounded bg-slate-800/90" />
          <div className="w-full h-3.5 rounded bg-slate-800/60" />
          <div className="w-4/5 h-3.5 rounded bg-slate-800/60" />
        </div>

        {/* Tech stack pills */}
        <div className="flex flex-wrap gap-1.5">
          <div className="w-14 h-4 rounded bg-slate-800/60" />
          <div className="w-16 h-4 rounded bg-slate-800/60" />
          <div className="w-12 h-4 rounded bg-slate-800/60" />
        </div>

        {/* Action row */}
        <div className="pt-3 border-t border-slate-800/60 flex items-center gap-3">
          <div className="flex-1 h-8 rounded-lg bg-slate-800/80" />
          <div className="w-20 h-8 rounded-lg bg-slate-800/80" />
        </div>
      </div>
    </div>
  );
}

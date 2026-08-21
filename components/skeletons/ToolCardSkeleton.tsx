export default function ToolCardSkeleton() {
  return (
    <div className="relative flex flex-col justify-between p-5 rounded-2xl bg-[#0c0e17]/80 border border-slate-800/80 overflow-hidden shadow-lg animate-pulse backdrop-blur-sm">
      {/* Shimmer sweep effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />

      <div className="space-y-4">
        {/* Header icon & badge */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50" />
          <div className="w-16 h-5 rounded-full bg-slate-800/80" />
        </div>

        {/* Title & Description lines */}
        <div className="space-y-2">
          <div className="w-3/4 h-5 rounded-md bg-slate-800/90" />
          <div className="w-full h-3.5 rounded bg-slate-800/60" />
          <div className="w-4/5 h-3.5 rounded bg-slate-800/60" />
        </div>
      </div>

      {/* Tags & Action row */}
      <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-12 h-4 rounded bg-slate-800/60" />
          <div className="w-10 h-4 rounded bg-slate-800/60" />
        </div>
        <div className="w-20 h-7 rounded-lg bg-slate-800/80" />
      </div>
    </div>
  );
}

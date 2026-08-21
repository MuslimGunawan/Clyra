export default function PromptCardSkeleton() {
  return (
    <div className="relative flex flex-col bg-[#0f111a]/80 border border-slate-800/80 rounded-xl overflow-hidden shadow-lg animate-pulse backdrop-blur-sm">
      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />

      {/* Image Banner */}
      <div className="w-full h-56 sm:h-64 bg-slate-900/90 relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-slate-800/60" />
        <div className="absolute top-3 left-3 w-24 h-5 rounded-full bg-slate-800/80" />
        <div className="absolute top-3 right-3 w-16 h-5 rounded bg-slate-800/80" />
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="w-3/4 h-5 rounded bg-slate-800/90" />
          <div className="w-full h-12 rounded-lg bg-slate-900/90 border border-slate-800/60" />
        </div>

        {/* Action button */}
        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <div className="w-20 h-4 rounded bg-slate-800/60" />
          <div className="w-24 h-7 rounded-lg bg-slate-800/80" />
        </div>
      </div>
    </div>
  );
}

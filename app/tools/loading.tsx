import ToolCardSkeleton from "@/components/skeletons/ToolCardSkeleton";

export default function ToolsLoading() {
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="bg-[#0c0e17] border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-3 animate-pulse">
        <div className="w-28 h-5 rounded-full bg-slate-800" />
        <div className="w-64 h-8 rounded-xl bg-slate-800" />
        <div className="w-full sm:w-1/2 h-4 rounded bg-slate-800/60" />
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div className="h-12 rounded-xl bg-[#0e111a] border border-slate-800/80 animate-pulse" />

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

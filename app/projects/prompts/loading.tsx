import PromptCardSkeleton from "@/components/skeletons/PromptCardSkeleton";

export default function PromptsLoading() {
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="bg-[#0c0e17] border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-3 animate-pulse">
        <div className="w-28 h-5 rounded-full bg-slate-800" />
        <div className="w-72 h-8 rounded-xl bg-slate-800" />
        <div className="w-full sm:w-1/2 h-4 rounded bg-slate-800/60" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <PromptCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

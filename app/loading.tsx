import ToolCardSkeleton from "@/components/skeletons/ToolCardSkeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      {/* Hero section skeleton */}
      <div className="space-y-4 max-w-3xl">
        <div className="w-32 h-6 rounded-full bg-slate-800/80 animate-pulse" />
        <div className="w-full sm:w-3/4 h-12 rounded-2xl bg-slate-800/90 animate-pulse" />
        <div className="w-full sm:w-2/3 h-5 rounded-lg bg-slate-800/60 animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

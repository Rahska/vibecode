import { motion } from "framer-motion";

export function PageSkeleton() {
  return (
    <div className="p-6 lg:p-14 w-full h-full">
      <div className="w-1/3 h-12 skeleton-shimmer rounded-xl mb-4" />
      <div className="w-1/4 h-6 skeleton-shimmer rounded-xl mb-12" />
      
      <div className="w-full h-24 skeleton-shimmer rounded-2xl mb-12" />
      
      <div className="w-1/4 h-8 skeleton-shimmer rounded-xl mb-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass-card p-3">
            <div className="w-full h-[240px] rounded-xl skeleton-shimmer mb-4" />
            <div className="w-1/4 h-4 skeleton-shimmer rounded mb-2" />
            <div className="w-3/4 h-6 skeleton-shimmer rounded mb-4" />
            <div className="w-1/2 h-4 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

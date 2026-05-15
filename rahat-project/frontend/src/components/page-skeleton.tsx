import { motion } from "framer-motion";

export function PageSkeleton() {
  return (
    <div className="p-6 lg:p-14 w-full h-full">
      <div className="w-1/3 h-12 bg-white/5 rounded-xl animate-pulse mb-4" />
      <div className="w-1/4 h-6 bg-white/5 rounded-xl animate-pulse mb-12" />
      
      <div className="w-full h-24 bg-white/5 rounded-2xl animate-pulse mb-12" />
      
      <div className="w-1/4 h-8 bg-white/5 rounded-xl animate-pulse mb-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass-card p-3">
            <div className="w-full h-[240px] rounded-xl bg-white/5 animate-pulse mb-4" />
            <div className="w-1/4 h-4 bg-white/5 rounded animate-pulse mb-2" />
            <div className="w-3/4 h-6 bg-white/5 rounded animate-pulse mb-4" />
            <div className="w-1/2 h-4 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

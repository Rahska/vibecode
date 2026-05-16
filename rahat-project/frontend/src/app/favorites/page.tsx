"use client";

import { useOrbitaStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Star, Users, Heart } from "lucide-react";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  'YURT': 'Юрта', 'TAPCHAN': 'Тапчан', 'VIP': 'VIP',
  'FIELD': 'Поляна', 'GAZEBO': 'Беседка', 'BBQ': 'Мангал',
};

export default function FavoritesPage() {
  const { locations, favorites, toggleFavorite, settings } = useOrbitaStore();
  const favoriteLocations = (locations || []).filter(loc => (favorites || []).includes(loc.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 lg:p-14 w-full"
    >
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 text-white">
          Ваше <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-500">Избранное</span>
        </h1>
        <p className="text-slate-400">Сохранённые места для быстрого доступа.</p>
      </motion.header>

      <AnimatePresence mode="wait">
        {favoriteLocations.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel p-10 text-center flex flex-col items-center justify-center min-h-[300px]"
          >
            <Heart className="w-14 h-14 text-slate-600 mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">Список пуст</h2>
            <p className="text-slate-400 mb-5">Изучите каталог и сохраняйте понравившиеся места.</p>
            <Link href="/" className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition-colors">
              К каталогу
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
          >
            {favoriteLocations.map((loc, idx) => (
              <Link href={`/location/${loc.id}`} key={loc.id}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className={`glass-card ${loc.glowColor || ''} p-3 cursor-pointer group relative`}
                >
                  <div className="relative w-full h-[200px] rounded-xl overflow-hidden mb-3">
                    <img
                      src={loc.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000'}
                      alt={loc.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(loc.id);
                        toast.info("Удалено из избранного");
                      }}
                      className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors z-10"
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </button>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold text-white">{loc.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="px-1 pb-1">
                    <div className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-1">
                      {TYPE_LABELS[loc.type] || loc.type}
                    </div>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-lg font-semibold text-white truncate">{loc.name}</h3>
                      <div className="text-right whitespace-nowrap shrink-0">
                        <span className="text-base font-bold text-white">{settings?.currency}{loc.pricePerHour.toLocaleString()}</span>
                        <span className="text-xs text-slate-400">/ч</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>До {loc.capacity} гостей</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

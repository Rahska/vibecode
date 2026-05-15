"use client";

import { useRahatStore } from "@/lib/store";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Users, Heart } from "lucide-react";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  'YURT': 'Юрта', 'TAPCHAN': 'Тапчан', 'VIP': 'VIP',
  'FIELD': 'Поляна', 'GAZEBO': 'Беседка', 'BBQ': 'Мангал',
};

export default function FavoritesPage() {
  const { locations, favorites, toggleFavorite } = useRahatStore();
  const favoriteLocations = locations.filter(loc => favorites.includes(loc.id));

  return (
    <div className="p-6 lg:p-14 w-full">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-4xl lg:text-5xl font-semibold mb-2 text-white">
          Ваше <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-500">Избранное</span>
        </h1>
        <p className="text-slate-400 text-lg">Сохранённые места для быстрого доступа.</p>
      </motion.header>

      {favoriteLocations.length === 0 ? (
        <div className="glass-panel p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Heart className="w-16 h-16 text-slate-600 mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Список пуст</h2>
          <p className="text-slate-400 mb-6">Изучите каталог и сохраняйте понравившиеся места.</p>
          <Link href="/" className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition-colors">
            К каталогу
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favoriteLocations.map((loc, idx) => (
            <Link href={`/location/${loc.id}`} key={loc.id}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`glass-card ${loc.glowColor || ''} p-3 cursor-pointer group relative`}
              >
                <div className="relative w-full h-[240px] rounded-xl overflow-hidden mb-4">
                  <img
                    src={loc.images[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000'}
                    alt={loc.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(loc.id);
                      toast.info("Удалено из избранного");
                    }}
                    className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors z-10"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>

                  <div className="absolute top-3 right-3 glass-panel !rounded-full px-3 py-1 !border-white/10 flex items-center gap-1 bg-black/40">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold text-white">{loc.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="px-2 pb-2">
                  <div className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    {TYPE_LABELS[loc.type] || loc.type}
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-white truncate pr-2">{loc.name}</h3>
                    <div className="text-right whitespace-nowrap">
                      <span className="text-lg font-bold text-white">₸{loc.pricePerHour.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">/ч</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Users className="w-4 h-4" />
                    <span>До {loc.capacity} гостей</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

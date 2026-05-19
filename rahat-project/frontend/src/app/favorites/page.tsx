"use client";

import { useOrbitaStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Star, Users, Heart } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const TYPE_LABELS: Record<string, string> = {
  'YURT': 'Юрта', 'TAPCHAN': 'Тапчан', 'VIP': 'VIP',
  'FIELD': 'Поляна', 'GAZEBO': 'Беседка', 'BBQ': 'Мангал',
};

export default function FavoritesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { locations, favorites, toggleFavorite, settings } = useOrbitaStore();
  const favoriteLocations = (locations || []).filter(loc => (favorites || []).includes(loc.id));

  if (!mounted) {
    return (
      <div className="p-4 md:p-6 lg:p-14 w-full flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

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
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>До {loc.capacity} гостей</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const message = encodeURIComponent(`Здравствуйте! Хочу забронировать: ${loc.name}`);
                        window.open(`https://wa.me/${settings?.whatsappNumber || '77001234567'}?text=${message}`, '_blank');
                      }}
                      className="w-full h-10 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group/btn hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] mt-2"
                    >
                      <svg className="w-4 h-4 fill-current transition-transform group-hover/btn:scale-110" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.019 14.12 1 11.999 1c-5.438 0-9.863 4.37-9.867 9.8-.001 1.767.469 3.5 1.359 5.022L2.483 20.31l4.164-1.156zM17.84 14.88c-.324-.162-1.92-.947-2.217-1.055-.298-.108-.515-.162-.73.162-.216.324-.836 1.055-1.025 1.27-.19.216-.379.243-.703.08-1.58-.79-2.735-1.37-3.826-2.296-.288-.244-.457-.546-.541-.87-.084-.324.237-.58.468-.813.12-.12.269-.324.378-.459.081-.108.135-.189.189-.324.054-.135.027-.243-.014-.324-.04-.081-.513-1.298-.703-1.758-.185-.445-.37-.384-.513-.391-.133-.007-.285-.007-.438-.007-.153 0-.405.057-.617.291-.212.234-.81.791-.81 1.929 0 1.137.828 2.239.941 2.392.113.153 1.63 2.49 3.95 3.493.552.239.983.381 1.32.488.555.176 1.06.151 1.46.091.446-.067 1.36-.554 1.55-1.088.19-.534.19-1.02.133-1.115-.057-.095-.213-.153-.538-.315z"/>
                      </svg>
                      <span>Написать в WhatsApp</span>
                    </button>
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

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Compass, Star, Users, Heart, Flame, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useOrbitaStore } from "@/lib/store";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/page-skeleton";

const TYPES = ['Все', 'YURT', 'TAPCHAN', 'VIP', 'FIELD', 'GAZEBO', 'BBQ'] as const;
type FilterType = typeof TYPES[number];

const TYPE_LABELS: Record<string, string> = {
  'Все': 'Все',
  'YURT': 'Юрты',
  'TAPCHAN': 'Тапчаны',
  'VIP': 'VIP',
  'FIELD': 'Поляны',
  'GAZEBO': 'Беседки',
  'BBQ': 'Мангал',
};

const TYPE_FILTER_MAP: Record<string, string | null> = {
  'Все': null,
  'YURT': 'YURT',
  'TAPCHAN': 'TAPCHAN',
  'VIP': 'VIP',
  'FIELD': 'FIELD',
  'GAZEBO': 'GAZEBO',
  'BBQ': 'BBQ',
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(50000);

  const { locations, favorites, toggleFavorite, bookings, recentlyViewed, settings } = useOrbitaStore();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
    if (!favorites.includes(id)) {
      toast.success("Добавлено в избранное", { icon: "❤️" });
    } else {
      toast.info("Удалено из избранного");
    }
  };

  const getBookingCount = (locId: string) =>
    bookings.filter(b => b.locationId === locId && b.status === 'CONFIRMED').length;

  const popularLocations = [...locations]
    .sort((a, b) => getBookingCount(b.id) - getBookingCount(a.id) || b.rating - a.rating)
    .slice(0, 3);

  const filterTypeValue = TYPE_FILTER_MAP[activeFilter];

  const filteredLocations = locations.filter(loc => {
    const matchType = filterTypeValue === null || loc.type === filterTypeValue;
    const matchSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice = loc.pricePerHour <= maxPrice;
    return matchType && matchSearch && matchPrice;
  });

  const recentlyViewedLocations = recentlyViewed
    .map(id => locations.find(l => l.id === id))
    .filter(Boolean)
    .slice(0, 4) as typeof locations;

  if (isLoading) return <PageSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-6 lg:p-14 w-full"
    >
      {/* Шапка */}
      <motion.header
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-10 gap-6"
      >
        <div>
          <h1 className="text-4xl lg:text-5xl font-semibold mb-2 text-white">
            Исследуйте, <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-500">Открывайте</span>
          </h1>
          <p className="text-slate-400 text-lg">Найдите идеальное место для отдыха.</p>
        </div>
        <div className="glass-panel px-6 py-3 flex items-center gap-4 w-fit">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
          <span className="text-sm font-medium text-white">{locations.length} мест доступно</span>
        </div>
      </motion.header>

      {/* Поиск */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="glass-panel p-2 mb-8 flex flex-col md:flex-row items-center gap-2"
      >
        <input
          type="text"
          placeholder="Поиск юрт, VIP-зон, беседок..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 w-full bg-transparent px-6 py-4 text-white placeholder:text-slate-500 outline-none text-base"
        />
        <div className="w-full md:w-px h-px md:h-10 bg-white/10" />
        <div className="flex items-center gap-3 px-4 py-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Макс: {settings.currency}{maxPrice.toLocaleString()}</span>
          <input
            type="range" min={5000} max={50000} step={1000} value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full md:w-32 accent-cyan-500 cursor-pointer"
          />
        </div>
        <button className="w-full md:w-auto h-14 px-8 rounded-[1.25rem] bg-gradient-to-r from-orange-500 to-rose-600 text-white font-semibold flex justify-center items-center gap-2 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300">
          <Compass className="w-5 h-5" />
          Найти
        </button>
      </motion.div>

      {/* Фильтры */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="flex gap-2 mb-10 overflow-x-auto pb-2 hide-scrollbar"
      >
        {TYPES.map(type => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${activeFilter === type
              ? 'bg-orange-500 text-black border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]'
              : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
          >
            {TYPE_LABELS[type]}
          </button>
        ))}
      </motion.div>

      {/* Популярное */}
      {activeFilter === 'Все' && searchQuery === '' && (
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-5 h-5 text-orange-400" />
            <h2 className="text-2xl font-semibold text-white">Популярное</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {popularLocations.map((loc, idx) => {
              const isFav = favorites.includes(loc.id);
              return (
                <Link href={`/location/${loc.id}`} key={loc.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="relative rounded-2xl overflow-hidden h-48 group cursor-pointer"
                  >
                    <img src={loc.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" alt={loc.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    {idx === 0 && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Flame className="w-3 h-3" /> #1 Популярное
                      </div>
                    )}
                    <button onClick={(e) => handleFavorite(e, loc.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-bold text-white text-lg">{loc.name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-sm">{settings.currency}{loc.pricePerHour.toLocaleString()}/ч</span>
                        <span className="text-yellow-400 text-sm">★ {loc.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Недавно просмотренные */}
      {recentlyViewedLocations.length > 0 && activeFilter === 'Все' && searchQuery === '' && (
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-slate-400" />
            <h2 className="text-2xl font-semibold text-white">Недавно просмотрено</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            {recentlyViewedLocations.map((loc) => (
              <Link href={`/location/${loc.id}`} key={loc.id} className="flex-shrink-0">
                <div className="w-52 glass-card p-2 group cursor-pointer">
                  <div className="w-full h-28 rounded-xl overflow-hidden mb-3">
                    <img src={loc.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" alt={loc.name} />
                  </div>
                  <div className="px-1 pb-1">
                    <p className="text-white font-semibold text-sm truncate">{loc.name}</p>
                    <p className="text-slate-400 text-xs">{settings.currency}{loc.pricePerHour.toLocaleString()}/ч</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* Основная сетка */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">
          {activeFilter === 'Все' ? 'Все места' : TYPE_LABELS[activeFilter]}
          <span className="ml-2 text-slate-500 text-base font-normal">({filteredLocations.length})</span>
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {filteredLocations.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-panel p-16 text-center flex flex-col items-center"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">Ничего не найдено</h3>
            <p className="text-slate-400 mb-6">Попробуйте изменить фильтры или поисковый запрос</p>
            <button onClick={() => { setActiveFilter('Все'); setSearchQuery(''); setMaxPrice(50000); }}
              className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-slate-200 transition-colors">
              Сбросить фильтры
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredLocations.map((loc, idx) => {
              const isFav = favorites.includes(loc.id);
              return (
                <Link href={`/location/${loc.id}`} key={loc.id}>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                    className={`glass-card ${loc.glowColor || ''} p-3 cursor-pointer group relative`}
                  >
                    <div className="relative w-full h-[240px] rounded-xl overflow-hidden mb-4">
                      <img
                        src={loc.images[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000'}
                        alt={loc.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />

                      <button
                        onClick={(e) => handleFavorite(e, loc.id)}
                        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors z-10"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                      </button>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-white">{loc.rating.toFixed(1)}</span>
                      </div>

                      {!loc.isActive && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                          <span className="text-slate-300 font-semibold bg-black/50 px-3 py-1 rounded-full text-sm">Временно недоступно</span>
                        </div>
                      )}
                    </div>
                    <div className="px-2 pb-2">
                      <div className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-1">
                        {TYPE_LABELS[loc.type] || loc.type}
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-white truncate pr-2">{loc.name}</h3>
                        <div className="text-right whitespace-nowrap">
                          <span className="text-lg font-bold text-white">{settings.currency}{loc.pricePerHour.toLocaleString()}</span>
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
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

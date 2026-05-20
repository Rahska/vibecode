"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Compass, Star, Users, Heart, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useOrbitaStore } from "@/lib/store";
import { toast } from "sonner";

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

export function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { locations, favorites, toggleFavorite, bookings, settings } = useOrbitaStore();

  if (!mounted) {
    return (
      <div className="p-4 md:p-6 lg:p-14 w-full flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

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
    (bookings || []).filter(b => b.locationId === locId && b.status === 'CONFIRMED').length;

  const popularLocations = [...(locations || [])]
    .sort((a, b) => getBookingCount(b.id) - getBookingCount(a.id) || b.rating - a.rating)
    .slice(0, 3);

  const filterTypeValue = TYPE_FILTER_MAP[activeFilter];

  const filteredLocations = (locations || []).filter(loc => {
    const matchType = filterTypeValue === null || loc.type === filterTypeValue;
    const matchSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice = (loc.pricePerHour ?? 0) <= maxPrice;
    return matchType && matchSearch && matchPrice;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-4 md:p-6 lg:p-14 w-full"
    >
      <motion.header
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 text-white">
            Исследуйте, <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-500">Открывайте</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg">Найдите идеальное место для отдыха.</p>
        </div>
        <div className="glass-panel px-4 py-2.5 flex items-center gap-3 w-fit shrink-0">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
          <span className="text-sm font-medium text-white">{(locations || []).length} мест доступно</span>
        </div>
      </motion.header>

      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="glass-panel p-2 mb-6 flex flex-col md:flex-row items-center gap-2"
      >
        <input
          type="text"
          placeholder="Поиск юрт, VIP-зон, беседок..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 w-full bg-transparent px-4 py-3 text-white placeholder:text-slate-500 outline-none text-base"
        />
        <div className="w-full md:w-px h-px md:h-10 bg-white/10" />
        <div className="flex items-center gap-3 px-4 py-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Макс: {settings?.currency}{maxPrice.toLocaleString()}</span>
          <input
            type="range" min={5000} max={50000} step={1000} value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full md:w-28 accent-cyan-500 cursor-pointer"
          />
        </div>
        <button className="w-full md:w-auto h-12 px-6 rounded-[1.25rem] bg-gradient-to-r from-orange-500 to-rose-600 text-white font-semibold flex justify-center items-center gap-2 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300 shrink-0">
          <Compass className="w-4 h-4" />
          Найти
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar"
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

      {activeFilter === 'Все' && searchQuery === '' && popularLocations.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-5">
            <Flame className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl md:text-2xl font-semibold text-white">Популярное</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularLocations.map((loc, idx) => {
              const isFav = (favorites || []).includes(loc.id);
              return (
                <Link href={`/location/${loc.id}`} key={loc.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="relative rounded-2xl overflow-hidden h-44 group cursor-pointer"
                  >
                    <img src={loc.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" alt={loc.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    {idx === 0 && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Flame className="w-3 h-3" /> #1 Популярное
                      </div>
                    )}
                    <button onClick={(e) => handleFavorite(e, loc.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="font-bold text-white text-base truncate">{loc.name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-sm">{settings?.currency}{(loc.pricePerHour ?? 0).toLocaleString()}/ч</span>
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

      <div className="mb-5 flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-semibold text-white">
          {activeFilter === 'Все' ? 'Все места' : TYPE_LABELS[activeFilter]}
          <span className="ml-2 text-slate-500 text-base font-normal">({filteredLocations.length})</span>
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {filteredLocations.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-panel p-12 text-center flex flex-col items-center"
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">Ничего не найдено</h3>
            <p className="text-slate-400 mb-5">Попробуйте изменить фильтры или поисковый запрос</p>
            <button onClick={() => { setActiveFilter('Все'); setSearchQuery(''); setMaxPrice(50000); }}
              className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-slate-200 transition-colors">
              Сбросить фильтры
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
          >
            {filteredLocations.map((loc, idx) => {
              const isFav = (favorites || []).includes(loc.id);
              return (
                <Link href={`/location/${loc.id}`} key={loc.id}>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    className={`glass-card ${loc.glowColor || ''} p-3 cursor-pointer group relative`}
                  >
                    <div className="relative w-full h-[200px] md:h-[220px] rounded-xl overflow-hidden mb-3">
                      <img
                        src={loc.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000'}
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
                    <div className="px-1 pb-1">
                      <div className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-1">
                        {TYPE_LABELS[loc.type] || loc.type}
                      </div>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="text-lg font-semibold text-white truncate">{loc.name}</h3>
                        <div className="text-right whitespace-nowrap shrink-0">
                          <span className="text-base font-bold text-white">{settings?.currency}{(loc.pricePerHour ?? 0).toLocaleString()}</span>
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
                          window.open(`https://wa.me/${settings?.whatsappNumber || '77071234567'}?text=${message}`, '_blank');
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
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRahatStore } from "@/lib/store";
import { MapPin, ArrowRight, X, Star, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TYPE_LABELS: Record<string, string> = {
  'YURT': 'Юрта',
  'VIP': 'VIP',
  'GAZEBO': 'Беседка',
  'BBQ': 'Мангал',
  'FIELD': 'Поляна',
  'TAPCHAN': 'Тапчан',
};

export default function MapPage() {
  const { locations } = useRahatStore();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const mapCoordinates: Record<string, { x: number; y: number; color: string }> = {
    '1': { x: 20, y: 30, color: 'bg-cyan-500' },
    '2': { x: 70, y: 40, color: 'bg-blue-500' },
    '3': { x: 45, y: 70, color: 'bg-emerald-500' },
    '4': { x: 80, y: 20, color: 'bg-cyan-500' },
    '5': { x: 30, y: 80, color: 'bg-purple-500' },
    '6': { x: 85, y: 75, color: 'bg-rose-500' },
  };

  const selectedLocData = locations.find(l => l.id === selectedLocation);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'YURT': return 'bg-cyan-500';
      case 'VIP': return 'bg-blue-500';
      case 'GAZEBO': return 'bg-emerald-500';
      case 'BBQ': return 'bg-purple-500';
      case 'FIELD': return 'bg-rose-500';
      default: return 'bg-white';
    }
  };

  const legendItems = [
    { label: 'Юрта', color: 'bg-cyan-500' },
    { label: 'VIP', color: 'bg-blue-500' },
    { label: 'Беседка', color: 'bg-emerald-500' },
    { label: 'Мангал', color: 'bg-purple-500' },
    { label: 'Поляна', color: 'bg-rose-500' },
  ];

  return (
    <div className="p-6 lg:p-14 w-full h-full flex flex-col relative overflow-hidden">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-4xl lg:text-5xl font-semibold mb-2 text-white">
          Интерактивная <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">Карта</span>
        </h1>
        <p className="text-slate-400 text-lg">Исследуйте территорию и найдите своё идеальное место.</p>
      </motion.header>

      <div className="flex-1 flex gap-6 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 glass-panel rounded-3xl relative overflow-hidden bg-[#0A0A0A]/50 border-white/5 min-h-[600px]"
        >
          {/* Легенда */}
          <div className="absolute top-6 left-6 z-20 glass-card p-4 rounded-2xl flex flex-col gap-3 backdrop-blur-md">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-1">Легенда</h3>
            {legendItems.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
                <span className="text-sm text-slate-300 font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Сетка карты */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* Декоративные элементы территории */}
          <div className="absolute top-[10%] right-[15%] w-[30%] h-[25%] bg-blue-500/10 rounded-[100px] blur-2xl pointer-events-none" />
          <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[30%] bg-emerald-500/10 rounded-[100px] blur-2xl pointer-events-none" />

          {/* Маркеры на карте */}
          {locations.map((loc) => {
            const predefined = mapCoordinates[loc.id];
            const color = predefined ? predefined.color : getTypeColor(loc.type);

            const hashCode = (str: string) => str.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
            const randomX = 10 + (Math.abs(hashCode(loc.id)) % 80);
            const randomY = 10 + (Math.abs(hashCode(loc.id + "y")) % 80);

            const coords = predefined || { x: randomX, y: randomY, color };
            const isSelected = selectedLocation === loc.id;

            return (
              <div
                key={loc.id}
                className="absolute group z-10"
                style={{ left: `${coords.x}%`, top: `${coords.y}%`, transform: 'translate(-50%, -50%)' }}
                onClick={() => setSelectedLocation(isSelected ? null : loc.id)}
              >
                <div className={`absolute inset-0 rounded-full ${coords.color} opacity-20 animate-ping`} />
                <div className={`relative w-8 h-8 rounded-full ${coords.color} flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-125 transition-all duration-300 ${isSelected ? 'scale-125 ring-4 ring-white/30' : ''}`}>
                  <MapPin className="w-4 h-4 text-black" />
                </div>

                {/* Подсказка при наведении */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                  {loc.name}
                </div>
              </div>
            );
          })}

          {locations.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Нет мест на карте</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Боковая панель с деталями */}
        <AnimatePresence>
          {selectedLocData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-80 glass-panel rounded-3xl p-5 flex flex-col relative shrink-0"
            >
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition-colors z-10 border border-white/10"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              <div className="w-full h-48 rounded-2xl overflow-hidden mb-5">
                <img src={selectedLocData.images[0]} alt={selectedLocData.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white">{selectedLocData.name}</h3>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-lg whitespace-nowrap ml-2">
                  ₸{selectedLocData.pricePerHour.toLocaleString()}/ч
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-3">
                <span className="px-2 py-1 rounded-md bg-white/5 text-slate-300 border border-white/5">
                  {TYPE_LABELS[selectedLocData.type] || selectedLocData.type}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-slate-300">{selectedLocData.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-slate-300">До {selectedLocData.capacity}</span>
                </div>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1 line-clamp-4">
                {selectedLocData.description}
              </p>

              <Link href={`/location/${selectedLocData.id}`} className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                Подробнее <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

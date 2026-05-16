"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOrbitaStore, Location, Booking } from "@/lib/store";
import { MapPin, ArrowRight, X, Star, Users, Crosshair, Save, Maximize2, Minimize2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

const TYPE_LABELS: Record<string, string> = {
  'YURT': 'Юрта',
  'VIP': 'VIP',
  'GAZEBO': 'Беседка',
  'BBQ': 'Мангал',
  'FIELD': 'Поляна',
  'TAPCHAN': 'Тапчан',
};

// Initial coordinates for existing places (simulation of DB)
const INITIAL_COORDS: Record<string, { x: number; y: number; color: string }> = {
  '1': { x: 20, y: 30, color: 'bg-cyan-500' },
  '2': { x: 70, y: 40, color: 'bg-blue-500' },
  '3': { x: 45, y: 70, color: 'bg-emerald-500' },
  '4': { x: 80, y: 20, color: 'bg-cyan-500' },
  '5': { x: 30, y: 80, color: 'bg-purple-500' },
  '6': { x: 85, y: 75, color: 'bg-rose-500' },
};

export default function MapPage() {
  const { locations, isAdminLoggedIn, bookings } = useOrbitaStore();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempCoords, setTempCoords] = useState<Record<string, {x: number, y: number}>>({});
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const selectedLocData = locations.find(l => l.id === selectedLocation);

  const isOccupiedNow = (locationId: string) => {
    const now = new Date();
    const currentDate = format(now, 'yyyy-MM-dd');
    const currentHour = now.getHours();
    
    return bookings.some(b => 
      b.locationId === locationId && 
      b.date === currentDate && 
      currentHour >= b.startHour && 
      currentHour < b.endHour && 
      b.status === 'CONFIRMED'
    );
  };

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

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isEditMode || !selectedLocation) return;
    
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setTempCoords(prev => ({
      ...prev,
      [selectedLocation]: { x, y }
    }));
    toast.success("Позиция метки обновлена локально");
  };

  const saveMapChanges = () => {
    // In a real app, this would persist to the backend
    toast.success("Изменения карты сохранены");
    setIsEditMode(false);
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
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
      >
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
            Интерактивная <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-500">Карта</span>
          </h1>
          <p className="text-slate-400">Исследуйте территорию ОРБИТА и выбирайте лучшее место.</p>
        </div>

        {isAdminLoggedIn && (
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <button onClick={() => setIsEditMode(false)} className="px-6 py-2.5 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">Отмена</button>
                <button onClick={saveMapChanges} className="px-6 py-2.5 rounded-xl bg-white text-black font-bold flex items-center gap-2 hover:bg-slate-200 transition-all"><Save className="w-4 h-4" /> Сохранить</button>
              </>
            ) : (
              <button onClick={() => setIsEditMode(true)} className="px-6 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold flex items-center gap-2 hover:bg-cyan-500/20 transition-all"><Crosshair className="w-4 h-4" /> Редактировать карту</button>
            )}
          </div>
        )}
      </motion.header>

      <div className={`flex flex-col lg:flex-row gap-6 relative min-h-0 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#0A0A0A] p-6 lg:p-14' : 'flex-1'}`}>
        <motion.div
          ref={mapRef}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleMapClick}
          className={`glass-panel rounded-[2.5rem] relative overflow-hidden bg-[#0A0A0A]/50 border-white/5 min-h-[500px] ${isFullscreen ? 'w-full h-full' : 'flex-1'} ${isEditMode ? 'cursor-crosshair ring-2 ring-cyan-500/50' : ''}`}
        >
          {/* Controls */}
          <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="w-10 h-10 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md hover:bg-white/10 transition-colors mb-2">
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button onClick={() => setScale(s => Math.min(s + 0.25, 2.5))} className="w-10 h-10 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md hover:bg-white/10 transition-colors">+</button>
            <button onClick={() => setScale(s => Math.max(s - 0.25, 0.5))} className="w-10 h-10 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md hover:bg-white/10 transition-colors">-</button>
          </div>

          <motion.div animate={{ scale }} className="w-full h-full absolute inset-0 origin-center transition-transform">
          {/* Легенда */}
          <div className="absolute top-6 left-6 z-20 glass-card p-5 rounded-[1.5rem] flex flex-col gap-4 backdrop-blur-xl border-white/10">
            <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 mb-1">Легенда</h3>
            {legendItems.map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_15px_rgba(255,255,255,0.1)]`} />
                <span className="text-sm text-slate-300 font-bold">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Сетка карты */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:60px_60px]" />

          {/* Декоративные элементы территории (имитация дорожек и зон) */}
          <div className="absolute top-[15%] left-[20%] w-[30%] h-[20%] border-2 border-white/[0.02] rounded-[50px] rotate-12" />
          <div className="absolute bottom-[25%] right-[10%] w-[40%] h-[30%] border-2 border-white/[0.02] rounded-[100px] -rotate-6" />
          <div className="absolute top-[40%] right-[30%] w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full" />
          <div className="absolute bottom-[40%] left-[30%] w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />

          {/* Маркеры */}
          {locations.map((loc) => {
            const predefined = INITIAL_COORDS[loc.id];
            const temp = tempCoords[loc.id];
            
            // Generate coordinates based on hash if not defined
            const hashCode = (str: string) => str.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
            const randomX = 15 + (Math.abs(hashCode(loc.id)) % 70);
            const randomY = 15 + (Math.abs(hashCode(loc.id + "y")) % 70);

            const x = temp?.x ?? predefined?.x ?? randomX;
            const y = temp?.y ?? predefined?.y ?? randomY;
            const color = predefined?.color ?? getTypeColor(loc.type);
            const occupied = isOccupiedNow(loc.id);
            const statusIndicator = occupied ? 'bg-red-500' : 'bg-emerald-500';
            const isSelected = selectedLocation === loc.id;

            return (
              <motion.div
                key={loc.id}
                layoutId={`marker-${loc.id}`}
                className="absolute group z-10"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                onClick={(e) => { e.stopPropagation(); setSelectedLocation(isSelected ? null : loc.id); }}
              >
                <div className={`absolute -inset-2 rounded-full ${statusIndicator} opacity-20 animate-ping`} />
                <div className={`absolute -inset-1 rounded-full border border-${statusIndicator} opacity-50`} />
                <div className={`relative w-10 h-10 rounded-full ${color} flex items-center justify-center shadow-2xl cursor-pointer hover:scale-125 transition-all duration-300 border-2 ${isSelected ? 'scale-125 ring-8 ring-white/10 border-white' : 'border-black/20'}`}>
                  <MapPin className="w-5 h-5 text-black" />
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-black/90 backdrop-blur-md rounded-2xl text-xs font-bold text-white whitespace-nowrap border border-white/10 shadow-2xl z-50"
                    >
                      {loc.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/90" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {isEditMode && selectedLocation && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 px-6 py-3 bg-cyan-500 text-black font-bold rounded-2xl shadow-2xl animate-bounce">
              Нажмите на карту, чтобы установить новую позицию для {selectedLocData?.name}
            </div>
          )}
          </motion.div>
        </motion.div>

        {/* Инфо-панель */}
        <AnimatePresence>
          {selectedLocData && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="w-full lg:w-96 glass-panel rounded-[2.5rem] p-6 flex flex-col relative shrink-0 border-white/10"
            >
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              <div className="w-full h-56 rounded-3xl overflow-hidden mb-6 relative">
                <img src={selectedLocData.images[0]} alt={selectedLocData.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/10">
                    {TYPE_LABELS[selectedLocData.type] || selectedLocData.type}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedLocData.name}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold text-white">{selectedLocData.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-400">до {selectedLocData.capacity} чел.</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Цена</div>
                  <div className="text-2xl font-bold text-cyan-400">₸{selectedLocData.pricePerHour.toLocaleString()}</div>
                </div>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1 line-clamp-4">
                {selectedLocData.description}
              </p>

              <Link href={`/location/${selectedLocData.id}`} className="w-full h-14 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-xl shadow-white/5">
                Забронировать место <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

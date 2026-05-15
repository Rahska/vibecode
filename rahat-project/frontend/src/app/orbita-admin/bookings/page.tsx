"use client";

import { useOrbitaStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Search, 
  Calendar, 
  User, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Clock,
  MoreVertical,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type TabType = 'ВСЕ' | 'АКТИВНЫЕ' | 'ОТМЕНЁННЫЕ' | 'ПРОШЕДШИЕ';

export default function AdminBookingsPage() {
  const { bookings, locations, updateBooking, isAdminLoggedIn, settings } = useOrbitaStore();
  const [activeTab, setActiveTab] = useState<TabType>('ВСЕ');
  const [search, setSearch] = useState("");
  const router = useRouter();

  if (!isAdminLoggedIn) {
    if (typeof window !== 'undefined') router.push('/orbita-admin');
    return null;
  }

  const today = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter(b => {
    const loc = locations.find(l => l.id === b.locationId);
    const matchesSearch = 
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone.includes(search) ||
      loc?.name.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'ВСЕ') return true;
    if (activeTab === 'ОТМЕНЁННЫЕ') return b.status === 'CANCELLED';
    if (activeTab === 'АКТИВНЫЕ') return b.status === 'CONFIRMED' && b.date >= today;
    if (activeTab === 'ПРОШЕДШИЕ') return b.status === 'CONFIRMED' && b.date < today;
    return true;
  });

  const handleStatusChange = (id: string, status: any) => {
    updateBooking(id, { status });
    toast.success(`Статус брони обновлён на ${status}`);
  };

  return (
    <div className="p-6 lg:p-14 w-full max-w-7xl mx-auto">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12"
      >
        <Link href="/orbita-admin" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" /> Назад в панель
        </Link>
        <h1 className="text-4xl font-bold text-white mb-2">Все Бронирования</h1>
        <p className="text-slate-400">Управление клиентскими запросами и историей заказов.</p>
      </motion.header>

      {/* Фильтры и поиск */}
      <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
          {['ВСЕ', 'АКТИВНЫЕ', 'ОТМЕНЁННЫЕ', 'ПРОШЕДШИЕ'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Поиск по имени, тел. или месту..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white outline-none focus:border-orange-500/50 transition-all text-sm"
          />
        </div>
      </div>

      {/* Список */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="glass-panel p-20 text-center text-slate-500 border-white/5">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold">Бронирований не найдено</p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const loc = locations.find(l => l.id === booking.locationId);
            return (
              <motion.div
                key={booking.id}
                layout
                className="glass-panel p-6 border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                      <img src={loc?.images[0]} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white">{loc?.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                          booking.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' :
                          booking.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' :
                          'bg-orange-500/10 text-orange-400'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <User className="w-4 h-4" /> {booking.customerName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" /> {booking.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Phone className="w-4 h-4" /> {booking.customerPhone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="w-4 h-4" /> {booking.startHour}:00 - {booking.endHour}:00
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col justify-between items-end">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Стоимость</div>
                      <div className="text-2xl font-black text-white">{settings.currency}{booking.totalPrice.toLocaleString()}</div>
                    </div>

                    <div className="flex gap-2">
                      {booking.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                            className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl text-xs hover:bg-emerald-400 transition-all"
                          >
                            Подтвердить
                          </button>
                          <button 
                            onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                            className="px-4 py-2 bg-red-500/10 text-red-400 font-bold rounded-xl text-xs hover:bg-red-500/20 border border-red-500/20 transition-all"
                          >
                            Отклонить
                          </button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                          className="px-4 py-2 bg-white/5 text-slate-400 font-bold rounded-xl text-xs hover:bg-white/10 transition-all"
                        >
                          Отменить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

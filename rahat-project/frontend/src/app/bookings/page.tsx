"use client";

import { useRahatStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, MapPin, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";

type TabType = 'ВСЕ' | 'ПРЕДСТОЯЩИЕ' | 'ПРОШЕДШИЕ' | 'ОТМЕНЁННЫЕ';

const TABS: { key: TabType; label: string }[] = [
  { key: 'ВСЕ', label: 'Все' },
  { key: 'ПРЕДСТОЯЩИЕ', label: 'Предстоящие' },
  { key: 'ПРОШЕДШИЕ', label: 'Прошедшие' },
  { key: 'ОТМЕНЁННЫЕ', label: 'Отменённые' },
];

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Подтверждено',
  CANCELLED: 'Отменено',
  COMPLETED: 'Завершено',
};

export default function BookingsPage() {
  const { bookings, locations, cancelBooking } = useRahatStore();
  const [activeTab, setActiveTab] = useState<TabType>('ВСЕ');

  const sortedBookings = [...bookings].sort((a, b) => b.createdAt - a.createdAt);
  const today = new Date().toISOString().split('T')[0];

  const filteredBookings = sortedBookings.filter(b => {
    if (activeTab === 'ВСЕ') return true;
    if (activeTab === 'ОТМЕНЁННЫЕ') return b.status === 'CANCELLED';
    if (activeTab === 'ПРЕДСТОЯЩИЕ') return b.status === 'CONFIRMED' && b.date >= today;
    if (activeTab === 'ПРОШЕДШИЕ') return b.status === 'CONFIRMED' && b.date < today;
    return true;
  });

  const totalSpent = bookings.filter(b => b.status === 'CONFIRMED').reduce((acc, curr) => acc + curr.totalPrice, 0);
  const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;

  const handleCancel = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    cancelBooking(id);
    toast.success("Бронь успешно отменена");
  };

  return (
    <div className="p-6 lg:p-14 w-full max-w-5xl">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-4xl lg:text-5xl font-semibold mb-2 text-white">
          Мои <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Брони</span>
        </h1>
        <p className="text-slate-400 text-lg">Управление предстоящими и прошедшими бронями.</p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="glass-card p-4 flex items-center justify-between border-l-4 border-l-cyan-500">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Потрачено</div>
            <div className="text-2xl font-bold text-white">₸{totalSpent.toLocaleString()}</div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between border-l-4 border-l-green-500">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Подтверждено</div>
            <div className="text-2xl font-bold text-white">{confirmedCount} броней</div>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between border-l-4 border-l-red-500">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Отменено</div>
            <div className="text-2xl font-bold text-white">{cancelledCount}</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}
      >
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
              activeTab === tab.key
                ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {filteredBookings.length === 0 ? (
        <div className="glass-panel p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
          <CalendarDays className="w-16 h-16 text-slate-600 mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Брони не найдены</h2>
          <p className="text-slate-400 mb-6">У вас нет бронирований в этой категории.</p>
          <Link href="/" className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition-colors">
            Найти место
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredBookings.map((booking, idx) => {
              const loc = locations.find(l => l.id === booking.locationId);
              if (!loc) return null;

              const isPast = booking.date < today;
              const isUpcoming = booking.date >= today && booking.status === 'CONFIRMED';

              const statusLabel = booking.status === 'CONFIRMED' && isPast
                ? 'COMPLETED'
                : booking.status;

              const statusClass = booking.status === 'CONFIRMED'
                ? isPast
                  ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30';

              return (
                <motion.div
                  layout
                  key={booking.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/location/${loc.id}`} className="block">
                    <div className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative group hover:border-cyan-500/50 transition-colors">
                      <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 relative">
                        <img src={loc.images[0]} alt={loc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                            {STATUS_LABELS[statusLabel] || statusLabel}
                          </span>
                          <span className="text-slate-500 text-sm font-mono">#{booking.id.toUpperCase().slice(0, 6)}</span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                          {loc.name} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
                        </h3>

                        <div className="flex flex-wrap gap-4 text-slate-300 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-cyan-400" />
                            {booking.date}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            {booking.startHour}:00 — {booking.endHour}:00
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-cyan-400" />
                            Алматы
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                        <div className="text-3xl font-bold text-white">₸{booking.totalPrice.toLocaleString()}</div>

                        {isUpcoming && (
                          <button
                            onClick={(e) => handleCancel(e, booking.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-semibold z-10"
                          >
                            <X className="w-4 h-4" /> Отменить
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

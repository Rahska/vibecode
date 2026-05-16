"use client";

import { useOrbitaStore, Booking } from "@/lib/store";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, Search, Filter, MoreVertical, Edit2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function AdminBookings() {
  const { bookings, locations, settings, updateBooking, isAdminLoggedIn } = useOrbitaStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  if (!isAdminLoggedIn) {
    if (typeof window !== 'undefined') window.location.href = '/orbita-admin';
    return null;
  }

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    updateBooking(bookingId, { status: newStatus });
    toast.success(`Статус изменен на ${newStatus}`);
  };

  const filteredBookings = bookings.filter(b => {
    const loc = locations.find(l => l.id === b.locationId);
    const matchesSearch = (b.customerName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                          (b.customerPhone?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                          (loc?.name.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-14 w-full max-w-7xl mx-auto">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <Link href="/orbita-admin" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" /> Назад в панель
          </Link>
          <h1 className="text-4xl font-bold text-white">Журнал бронирований</h1>
        </div>
      </motion.header>

      <div className="glass-panel p-8 border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Поиск по имени, телефону или локации..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white outline-none focus:border-orange-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                  statusFilter === status 
                    ? 'bg-orange-500 text-black border-orange-500' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                }`}
              >
                {status === 'ALL' ? 'Все' : status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID / Дата</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Клиент</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Локация / Время</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Сумма</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Статус</th>
                <th className="py-4 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => {
                const loc = locations.find(l => l.id === booking.locationId);
                const dateObj = new Date(booking.date);
                
                return (
                  <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-white">{format(dateObj, 'dd MMM yyyy', { locale: ru })}</div>
                      <div className="text-xs text-slate-500">#{booking.id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-bold text-white">{booking.customerName || 'Без имени'}</div>
                      <div className="text-xs text-slate-500">{booking.customerPhone || 'Нет номера'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-white">{loc?.name || 'Неизвестно'}</div>
                      <div className="text-xs text-slate-500">{booking.startHour}:00 - {booking.endHour}:00</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-bold text-orange-400">{settings.currency}{booking.totalPrice.toLocaleString()}</div>
                      {booking.deposit ? <div className="text-xs text-emerald-500">Задаток: {booking.deposit}</div> : null}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        booking.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        booking.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        booking.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                          title="Подтвердить"
                          className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500/20 text-emerald-400"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                          title="Отменить"
                          className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 text-red-400"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    Бронирования не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

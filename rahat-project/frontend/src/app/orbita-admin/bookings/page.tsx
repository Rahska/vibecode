"use client";

import { useOrbitaStore, Booking } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Calendar, Search, Filter, MoreVertical, Edit2, CheckCircle, XCircle, MessageCircle, Copy, Save, X, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function AdminBookings() {
  const { bookings, locations, settings, updateBooking, addBooking, isAdminLoggedIn } = useOrbitaStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState<Booking['paymentStatus']>('UNPAID');

  // Create Booking State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    locationId: '', date: format(new Date(), 'yyyy-MM-dd'), startHour: 10, endHour: 12, customerName: '', customerPhone: '', deposit: '', totalPrice: 0
  });

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

  const openBookingModal = (b: Booking) => {
    setSelectedBooking(b);
    setEditNotes(b.notes || "");
    setEditPaymentStatus(b.paymentStatus || 'UNPAID');
  };

  const saveBookingDetails = () => {
    if (!selectedBooking) return;
    updateBooking(selectedBooking.id, {
      notes: editNotes,
      paymentStatus: editPaymentStatus
    });
    toast.success("Детали брони сохранены");
    setSelectedBooking(null);
  };

  const copyBookingInfo = (b: Booking, locName: string) => {
    const text = `Бронь #${b.id}\nЛокация: ${locName}\nКлиент: ${b.customerName} (${b.customerPhone})\nДата: ${b.date}\nВремя: ${b.startHour}:00 - ${b.endHour}:00\nСумма: ${settings.currency}${b.totalPrice}`;
    navigator.clipboard.writeText(text);
    toast.success("Скопировано в буфер обмена");
  };

  const sendWhatsAppTemplate = (b: Booking, locName: string, type: 'confirm' | 'deposit') => {
    const phone = b.customerPhone.replace(/\D/g, '');
    let msg = "";
    if (type === 'confirm') {
      msg = `Здравствуйте, ${b.customerName}! Ваша бронь в ОРБИТА (${locName}) на ${b.date} с ${b.startHour}:00 до ${b.endHour}:00 успешно подтверждена. Ждем вас!`;
    } else {
      msg = `Здравствуйте, ${b.customerName}! Для подтверждения брони в ОРБИТА (${locName}) на ${b.date}, пожалуйста, внесите задаток.`;
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleCreateBooking = () => {
    if (!newBooking.locationId || !newBooking.date || newBooking.startHour >= newBooking.endHour) {
      toast.error("Проверьте правильность заполнения полей");
      return;
    }
    const loc = locations.find(l => l.id === newBooking.locationId);
    if (!loc) return;
    
    const price = (newBooking.endHour - newBooking.startHour) * loc.pricePerHour;
    
    addBooking({
      id: Math.random().toString(36).substr(2, 9),
      locationId: newBooking.locationId,
      date: newBooking.date,
      startHour: newBooking.startHour,
      endHour: newBooking.endHour,
      totalPrice: newBooking.totalPrice || price,
      status: 'CONFIRMED',
      paymentStatus: newBooking.deposit ? 'DEPOSIT_PAID' : 'UNPAID',
      deposit: newBooking.deposit,
      createdAt: Date.now(),
      customerName: newBooking.customerName || 'Бронь админа',
      customerPhone: newBooking.customerPhone || '',
      notes: ''
    });
    
    toast.success("Бронь создана");
    setShowCreateModal(false);
  };

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
        <button 
          onClick={() => {
            setNewBooking(prev => ({ ...prev, locationId: locations[0]?.id || '' }));
            setShowCreateModal(true);
          }}
          className="h-12 px-6 rounded-xl bg-orange-500 text-black font-bold flex items-center gap-2 hover:bg-orange-400 transition-colors"
        >
          <Plus className="w-5 h-5" /> Создать бронь
        </button>
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
                      <div className="text-[10px] font-bold mt-1">
                        {booking.paymentStatus === 'FULLY_PAID' ? <span className="text-emerald-500">Оплачено полностью</span> :
                         booking.paymentStatus === 'DEPOSIT_PAID' ? <span className="text-blue-400">Внесен задаток</span> :
                         <span className="text-red-400">Не оплачено</span>}
                      </div>
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
                        <button 
                          onClick={() => openBookingModal(booking)}
                          title="Детали и Финансы"
                          className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 text-blue-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => copyBookingInfo(booking, loc?.name || '')}
                          title="Копировать информацию"
                          className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center hover:bg-slate-500/20 text-slate-400"
                        >
                          <Copy className="w-4 h-4" />
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

      {/* Модальное окно редактирования брони */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md p-6 glass-panel border border-white/10 rounded-2xl bg-[#0a0a0a]/90">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Детали брони #{selectedBooking.id}</h3>
                <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Статус оплаты</label>
                  <select 
                    value={editPaymentStatus || 'UNPAID'} 
                    onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                  >
                    <option value="UNPAID" className="bg-[#111]">🔴 Не оплачено</option>
                    <option value="DEPOSIT_PAID" className="bg-[#111]">🔵 Внесен задаток</option>
                    <option value="FULLY_PAID" className="bg-[#111]">🟢 Оплачено полностью</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Заметки для админа</label>
                  <textarea 
                    value={editNotes} 
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Например: Клиент просил дополнительный стул"
                    rows={4}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Быстрые действия (WhatsApp)</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => sendWhatsAppTemplate(selectedBooking, locations.find(l => l.id === selectedBooking.locationId)?.name || '', 'confirm')}
                      className="flex-1 py-2 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Подтверждение
                    </button>
                    <button 
                      onClick={() => sendWhatsAppTemplate(selectedBooking, locations.find(l => l.id === selectedBooking.locationId)?.name || '', 'deposit')}
                      className="flex-1 py-2 text-xs font-bold rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Запросить задаток
                    </button>
                  </div>
                </div>

                <button 
                  onClick={saveBookingDetails}
                  className="w-full h-12 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                >
                  <Save className="w-4 h-4" /> Сохранить изменения
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Модальное окно создания брони */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg p-6 glass-panel border border-white/10 rounded-2xl bg-[#0a0a0a]/90 max-h-[90vh] overflow-y-auto hide-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Новая бронь</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Локация</label>
                  <select 
                    value={newBooking.locationId} 
                    onChange={(e) => setNewBooking({...newBooking, locationId: e.target.value})}
                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                  >
                    {locations.map(l => <option key={l.id} value={l.id} className="bg-[#111]">{l.name} ({settings.currency}{l.pricePerHour}/ч)</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 sm:col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Дата</label>
                    <input 
                      type="date" 
                      value={newBooking.date} 
                      onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">С (Час)</label>
                    <select 
                      value={newBooking.startHour} 
                      onChange={(e) => setNewBooking({...newBooking, startHour: Number(e.target.value)})}
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    >
                      {Array.from({length: 15}, (_, i) => i + 9).map(h => <option key={h} value={h} className="bg-[#111]">{h}:00</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">По (Час)</label>
                    <select 
                      value={newBooking.endHour} 
                      onChange={(e) => setNewBooking({...newBooking, endHour: Number(e.target.value)})}
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    >
                      {Array.from({length: 15}, (_, i) => i + 10).map(h => <option key={h} value={h} className="bg-[#111]">{h}:00</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Имя клиента</label>
                    <input 
                      type="text" placeholder="Имя"
                      value={newBooking.customerName} onChange={(e) => setNewBooking({...newBooking, customerName: e.target.value})}
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Телефон</label>
                    <input 
                      type="text" placeholder="+7..."
                      value={newBooking.customerPhone} onChange={(e) => setNewBooking({...newBooking, customerPhone: e.target.value})}
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Задаток (если есть)</label>
                    <input 
                      type="text" placeholder="Сумма задатка"
                      value={newBooking.deposit} onChange={(e) => setNewBooking({...newBooking, deposit: e.target.value})}
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Итоговая цена (своя)</label>
                    <input 
                      type="number" placeholder="Опционально"
                      value={newBooking.totalPrice || ''} onChange={(e) => setNewBooking({...newBooking, totalPrice: Number(e.target.value)})}
                      className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleCreateBooking}
                  className="w-full h-12 bg-orange-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-400 transition-colors mt-4"
                >
                  <Save className="w-4 h-4" /> Создать бронь
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfToday, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { useOrbitaStore } from "@/lib/store";
import { toast } from "sonner";

interface BookingWidgetProps {
  locationId: string;
  pricePerHour: number;
  locationName: string;
}

export function BookingWidget({ locationId, pricePerHour, locationName }: BookingWidgetProps) {
  const { settings, addBooking, bookings } = useOrbitaStore();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const today = startOfToday();
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const slots = Array.from({ length: 14 }, (_, i) => i + 9); // 09:00 - 22:00

  const handleSlotClick = (hour: number) => {
    if (selectedSlots.includes(hour)) {
      setSelectedSlots(selectedSlots.filter(s => s !== hour));
    } else {
      setSelectedSlots([...selectedSlots, hour].sort((a, b) => a - b));
    }
  };

  const isContiguous = (slots: number[]) => {
    if (slots.length <= 1) return true;
    for (let i = 0; i < slots.length - 1; i++) {
      if (slots[i+1] - slots[i] !== 1) return false;
    }
    return true;
  };

  const totalPrice = selectedSlots.length * pricePerHour;

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const locationBookings = isMounted ? bookings.filter(b => b.locationId === locationId && b.date === selectedDateStr && b.status !== 'CANCELLED') : [];

  const isOccupied = (hour: number) => {
    return locationBookings.some(b => hour >= b.startHour && hour < b.endHour);
  };

  const handleWhatsApp = () => {
    if (!selectedDate || selectedSlots.length === 0) {
      toast.error("Выберите дату и время");
      return;
    }

    if (!isContiguous(selectedSlots)) {
      toast.error("Пожалуйста, выбирайте идущие подряд часы");
      return;
    }

    const timeString = `${selectedSlots[0]}:00 - ${selectedSlots[selectedSlots.length - 1] + 1}:00`;
    const dateString = format(selectedDate, 'dd MMMM yyyy', { locale: ru });
    
    const message = encodeURIComponent(
      `${settings.whatsappMessage}\n\n` +
      `📍 Место: ${locationName || 'ORBITA'}\n` +
      `📅 Дата: ${dateString}\n` +
      `⏰ Время: ${timeString} (${selectedSlots.length} ч.)\n` +
      `💰 Итого: ${settings.currency}${totalPrice.toLocaleString()}\n\n` +
      `Меня зовут: ${customerName}\n` +
      `Тел: ${customerPhone}`
    );

    // Save to local bookings store for history
    addBooking({
      id: Math.random().toString(36).substr(2, 9),
      locationId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      startHour: selectedSlots[0],
      endHour: selectedSlots[selectedSlots.length - 1] + 1,
      totalPrice,
      status: 'PENDING',
      createdAt: Date.now(),
      customerName,
      customerPhone
    });

    const phone = settings.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success("Запрос отправлен в WhatsApp!");
  };

  if (!isMounted) {
    return <div className="glass-panel border-white/5 overflow-hidden shadow-2xl bg-[#111827]/50 h-[500px] animate-pulse"></div>;
  }

  return (
    <div className="glass-panel border-white/5 overflow-hidden shadow-2xl bg-[#111827]/50">
      <div className="p-8 border-b border-white/5 bg-white/5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Цена за час</span>
          <span className="text-white text-3xl font-black">{settings.currency}{pricePerHour.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Доступно сегодня
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Календарь */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-white font-bold text-lg flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-orange-500" /> Выберите дату
                  </h4>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">{d}</div>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory scroll-smooth touch-pan-x">
                  {daysInMonth.map((day, i) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isDisabled = isBefore(day, today);
                    return (
                      <button
                        key={i}
                        disabled={isDisabled}
                        onClick={() => setSelectedDate(day)}
                        className={`flex-shrink-0 w-14 h-20 rounded-2xl flex flex-col items-center justify-center transition-all snap-start border ${
                          isSelected 
                            ? 'bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20' 
                            : isDisabled
                              ? 'bg-transparent border-transparent opacity-20 cursor-not-allowed'
                              : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase mb-1">{format(day, 'EEE', { locale: ru })}</span>
                        <span className="text-lg font-black">{format(day, 'd')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Часы */}
              {selectedDate && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" /> Выберите время
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map(hour => {
                      const isSelected = selectedSlots.includes(hour);
                      const occupied = isOccupied(hour);
                      return (
                        <button
                          key={hour}
                          disabled={occupied}
                          onClick={() => handleSlotClick(hour)}
                          className={`relative h-12 rounded-xl text-xs font-bold transition-all border flex items-center justify-center overflow-hidden ${
                            occupied
                              ? 'bg-white/[0.02] text-slate-600 border-white/5 cursor-not-allowed'
                              : isSelected 
                                ? 'bg-white text-black border-white shadow-lg' 
                                : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30 hover:bg-white/10'
                          }`}
                        >
                          {occupied && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-red-500/50 rotate-[-15deg]"></div></div>}
                          {!occupied && !isSelected && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                          <span className={occupied ? 'opacity-50' : ''}>{hour}:00</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              <button
                disabled={!selectedDate || selectedSlots.length === 0}
                onClick={() => setStep(2)}
                className={`w-full h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                  selectedDate && selectedSlots.length > 0
                    ? 'bg-white text-black hover:bg-slate-200 shadow-2xl shadow-white/5'
                    : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                }`}
              >
                Продолжить <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h4 className="text-white font-bold text-xl">Ваши данные</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Как к вам обращаться?</label>
                    <input 
                      type="text" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Имя"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white outline-none focus:border-orange-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Номер телефона</label>
                    <input 
                      type="tel" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+7"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white outline-none focus:border-orange-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Выбрано часов:</span>
                  <span className="text-white font-bold">{selectedSlots.length} ч.</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-white/5">
                  <span className="text-white font-bold">Итого к оплате:</span>
                  <span className="text-orange-500 font-black">{settings.currency}{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 h-16 rounded-2xl font-bold border border-white/10 text-white hover:bg-white/5 transition-all"
                >
                  Назад
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex-[2] h-16 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20"
                >
                  <MessageCircle className="w-6 h-6" /> Забронировать
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 bg-white/5 border-t border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Info className="w-5 h-5 text-blue-400" />
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
          Нажимая кнопку, вы перейдете в WhatsApp для подтверждения бронирования с администратором.
        </p>
      </div>
    </div>
  );
}

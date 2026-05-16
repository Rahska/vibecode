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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const today = startOfToday();
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  
  const startingDayIndex = startOfMonth(currentMonth).getDay() === 0 ? 6 : startOfMonth(currentMonth).getDay() - 1;

  const slots = Array.from({ length: 14 }, (_, i) => i + 9); // 09:00 - 22:00

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayBookings = isMounted ? bookings.filter(b => b.locationId === locationId && b.date === dateStr && b.status !== 'CANCELLED') : [];
    if (dayBookings.length === 0) return 'FREE';
    
    let bookedHours = 0;
    dayBookings.forEach(b => { bookedHours += (b.endHour - b.startHour); });
    
    if (bookedHours >= 14) return 'BUSY';
    return 'PARTIAL';
  };

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
      `💰 Итого: ${settings.currency}${totalPrice.toLocaleString()}`
    );

    const phone = settings.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
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
        <motion.div
          key="step1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
              {/* Календарь */}
              <div>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#111827] z-10 py-2">
                  <h4 className="text-white font-bold text-xl flex items-center gap-2 capitalize">
                    {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                  </h4>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2 mb-6">
                  {Array.from({ length: startingDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {daysInMonth.map((day, i) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isDisabled = isBefore(day, today);
                    const status = isDisabled ? 'DISABLED' : getDayStatus(day);
                    
                    return (
                      <button
                        key={i}
                        disabled={isDisabled}
                        onClick={() => {
                          setSelectedDate(day);
                          setSelectedSlots([]); // Сбрасываем часы при смене даты
                        }}
                        className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border ${
                          isSelected 
                            ? 'bg-orange-500 border-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)] scale-105 z-10' 
                            : isDisabled
                              ? 'bg-transparent border-transparent opacity-20 cursor-not-allowed text-slate-500'
                              : 'bg-white/5 border-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg font-black">{format(day, 'd')}</span>
                        
                        {!isDisabled && !isSelected && (
                          <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${
                            status === 'FREE' ? 'bg-emerald-500' :
                            status === 'PARTIAL' ? 'bg-yellow-400' : 'bg-red-500'
                          }`} />
                        )}
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
                onClick={handleWhatsApp}
                className={`relative w-full h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden group ${
                  selectedDate && selectedSlots.length > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-100 hover:scale-[1.02]'
                    : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                }`}
              >
                {selectedDate && selectedSlots.length > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                )}
                <MessageCircle className="w-6 h-6 relative z-10" /> 
                <span className="relative z-10">Связаться в WhatsApp</span>
              </button>
            </motion.div>

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

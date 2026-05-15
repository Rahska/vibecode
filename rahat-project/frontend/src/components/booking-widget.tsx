"use client";

import { useState, useEffect } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useRahatStore, Booking } from "@/lib/store";
import { toast } from "sonner";
import { CheckCircle2, Clock, ShieldAlert, AlertCircle } from "lucide-react";

interface BookingWidgetProps {
  locationId: string;
  pricePerHour: number;
}

export function BookingWidget({ locationId, pricePerHour }: BookingWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const bookings = useRahatStore(state => state.bookings);
  const addBooking = useRahatStore(state => state.addBooking);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));
  
  // Generate hours from 10 to 23
  const hours = Array.from({ length: 14 }).map((_, i) => i + 10);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todaysBookings = bookings.filter(b => b.locationId === locationId && b.date === selectedDateStr && b.status === 'CONFIRMED');
  
  const isHourBooked = (hour: number) => {
    return todaysBookings.some(b => hour >= b.startHour && hour < b.endHour);
  };

  // Timer Effect
  useEffect(() => {
    if (selectedSlots.length > 0 && timeLeft === null) {
      setTimeLeft(600); // 10 minutes
    }
    
    if (selectedSlots.length === 0) {
      setTimeLeft(null);
    }
  }, [selectedSlots.length]);

  useEffect(() => {
    if (timeLeft === null || timeLeft === 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t && t <= 1) {
          clearInterval(timer);
          setSelectedSlots([]);
          toast.error("Booking session expired. Please select slots again.");
          return 0;
        }
        return t ? t - 1 : 0;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft === null]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleSlot = (hour: number) => {
    if (isHourBooked(hour)) return;
    
    if (selectedSlots.includes(hour)) {
      setSelectedSlots(selectedSlots.filter(h => h !== hour).sort((a,b)=>a-b));
    } else {
      setSelectedSlots([...selectedSlots, hour].sort((a,b)=>a-b));
    }
  };

  const isContiguous = () => {
    if (selectedSlots.length <= 1) return true;
    return selectedSlots.every((slot, index) => {
      if (index === 0) return true;
      return slot === selectedSlots[index - 1] + 1;
    });
  };

  const handleBook = () => {
    if (selectedSlots.length === 0) return;
    
    if (!isContiguous()) {
      toast.error("Please select contiguous time slots for a single booking.");
      return;
    }
    
    const startHour = Math.min(...selectedSlots);
    const endHour = Math.max(...selectedSlots) + 1;
    
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      locationId,
      date: selectedDateStr,
      startHour,
      endHour,
      totalPrice: selectedSlots.length * pricePerHour,
      status: 'CONFIRMED',
      createdAt: Date.now()
    };
    
    addBooking(newBooking);
    setSelectedSlots([]);
    setTimeLeft(null);
    setShowSuccess(true);
    toast.success("Successfully booked!");
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="glass-panel p-6 relative overflow-hidden">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(6,182,212,0.5)]">
              <CheckCircle2 className="w-10 h-10 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Booking Confirmed!</h3>
            <p className="text-slate-400 text-center px-4">Your premium spot is reserved. Check your bookings tab.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Select Date & Time</h3>
        <AnimatePresence>
          {timeLeft !== null && timeLeft > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`px-3 py-1.5 border rounded-full flex items-center gap-2 ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">{formatTime(timeLeft)}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Date Picker (Horizontal) */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
        {dates.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <button
              key={i}
              onClick={() => { setSelectedDate(date); setSelectedSlots([]); }}
              className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                isSelected 
                  ? "bg-cyan-500/20 border-cyan-500/50 border text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                  : "bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              <span className="text-xs font-medium uppercase">{format(date, 'EEE')}</span>
              <span className="text-lg font-bold">{format(date, 'd')}</span>
            </button>
          )
        })}
      </div>

      {/* Time Slots */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        {hours.map(hour => {
          const booked = isHourBooked(hour);
          const selected = selectedSlots.includes(hour);
          
          return (
            <button
              key={hour}
              disabled={booked}
              onClick={() => toggleSlot(hour)}
              className={`py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${
                booked 
                  ? "bg-red-500/10 border border-red-500/20 text-red-400/50 cursor-not-allowed" 
                  : selected
                    ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-[0.98]"
                    : "bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 text-slate-300 active:scale-95"
              }`}
            >
              {booked && <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,0,0,0.05)_10px,rgba(255,0,0,0.05)_20px)]" />}
              {booked && <ShieldAlert className="w-3 h-3 text-red-500" />}
              {!booked && selected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
              {!booked && !selected && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
              {hour}:00
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {!isContiguous() && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <p className="text-sm text-red-400">Please select contiguous time slots. Multiple separate bookings must be made individually.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-white/10 pt-6">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex justify-between items-center text-slate-400 text-sm">
            <span>Price per hour</span>
            <span className="font-medium text-white">${pricePerHour}</span>
          </div>
          
          <div className="flex justify-between items-start text-slate-400 text-sm">
            <span>Selected slots ({selectedSlots.length})</span>
            <div className="text-right max-w-[60%]">
              {selectedSlots.length > 0 ? (
                <span className="text-cyan-400 font-medium">
                  {selectedSlots.map(h => `${h}:00`).join(', ')}
                </span>
              ) : (
                <span className="italic">None</span>
              )}
            </div>
          </div>
          
          <div className="w-full h-px bg-white/10 my-2" />
          
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-semibold">Total Price</span>
            <motion.span 
              key={selectedSlots.length}
              initial={{ scale: 1.2, color: '#06b6d4' }}
              animate={{ scale: 1, color: '#ffffff' }}
              className="text-3xl font-bold"
            >
              ${selectedSlots.length * pricePerHour}
            </motion.span>
          </div>
        </div>
        
        <button 
          onClick={handleBook}
          disabled={selectedSlots.length === 0 || !isContiguous()}
          className={`w-full h-14 rounded-xl font-semibold text-lg transition-all duration-300 relative overflow-hidden group ${
            selectedSlots.length > 0 && isContiguous()
              ? "bg-white text-black hover:bg-slate-200 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              : "bg-white/5 text-slate-500 cursor-not-allowed"
          }`}
        >
          {selectedSlots.length > 0 && isContiguous() && (
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          )}
          Confirm Booking
        </button>
      </div>
    </div>
  );
}

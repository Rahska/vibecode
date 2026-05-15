"use client";

import { useRahatStore } from "@/lib/store";
import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function BookingsPage() {
  const { bookings, locations, cancelBooking } = useRahatStore();
  
  const sortedBookings = [...bookings].sort((a, b) => b.createdAt - a.createdAt);

  const handleCancel = (id: string) => {
    cancelBooking(id);
    toast.success("Booking cancelled successfully");
  };

  return (
    <div className="p-6 lg:p-14 w-full max-w-5xl">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-4xl lg:text-5xl font-semibold mb-2 text-white">
          My <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Bookings</span>
        </h1>
        <p className="text-slate-400 text-lg">Manage your upcoming and past reservations.</p>
      </motion.header>

      {sortedBookings.length === 0 ? (
        <div className="glass-panel p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
          <CalendarDays className="w-16 h-16 text-slate-600 mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">No bookings yet</h2>
          <p className="text-slate-400 mb-6">You haven't made any reservations. Find your perfect spot now.</p>
          <Link href="/" className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition-colors">
            Start Booking
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedBookings.map((booking, idx) => {
            const loc = locations.find(l => l.id === booking.locationId);
            if (!loc) return null;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative"
              >
                <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={loc.images[0]} alt={loc.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'CONFIRMED' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="text-slate-500 text-sm">ID: #{booking.id.toUpperCase()}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">{loc.name}</h3>
                  
                  <div className="flex flex-wrap gap-4 text-slate-300 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-cyan-400" />
                      {booking.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      {booking.startHour}:00 - {booking.endHour}:00
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      Almaty
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                  <div className="text-3xl font-bold text-white">${booking.totalPrice}</div>
                  
                  {booking.status === 'CONFIRMED' && (
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-semibold"
                    >
                      <X className="w-4 h-4" /> Cancel Booking
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  );
}

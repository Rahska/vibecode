"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useOrbitaStore } from "@/lib/store";
import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, Heart, Star, LogOut, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, profile, signOut, isLoading } = useAuthStore();
  const { bookings, favorites, locations } = useOrbitaStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const favoriteLocations = locations.filter(l => favorites.includes(l.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 lg:p-14 w-full max-w-7xl mx-auto"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          <div className="glass-panel p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-rose-500" />
            
            <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-orange-500">
              {profile?.display_name?.[0] || user.email?.[0].toUpperCase()}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-1">{profile?.display_name || "Пользователь"}</h2>
            <p className="text-slate-500 text-sm mb-6 capitalize">{profile?.role === 'admin' ? 'Администратор' : 'Клиент'}</p>
            
            <div className="space-y-4 text-left border-t border-white/5 pt-6">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm truncate">{user.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-3 text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                signOut();
                router.push("/");
              }}
              className="mt-8 w-full h-12 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" /> Выйти из аккаунта
            </button>
          </div>

          <div className="glass-panel p-6 border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Статистика</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-2xl font-bold text-orange-500">{userBookings.length}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Бронирований</div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-2xl font-bold text-cyan-500">{favorites.length}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">В избранном</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="lg:w-2/3 space-y-8">
          {/* Active Bookings */}
          <section>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-orange-500" /> Активные бронирования
            </h3>
            
            {userBookings.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-500 border-white/5">
                Нет активных бронирований
              </div>
            ) : (
              <div className="space-y-4">
                {userBookings.map(booking => {
                  const loc = locations.find(l => l.id === booking.locationId);
                  return (
                    <div key={booking.id} className="glass-panel p-5 border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                          <img src={loc?.images?.[0]} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{loc?.name || "Место"}</h4>
                          <p className="text-xs text-slate-500">{booking.date} • {booking.startHour}:00 - {booking.endHour}:00</p>
                        </div>
                      </div>
                      <Link href={`/location/${booking.locationId}`} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-all border border-white/10">
                        Подробнее
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Favorites */}
          <section>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Heart className="w-5 h-5 text-rose-500" /> Избранные места
            </h3>
            
            {favoriteLocations.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-500 border-white/5">
                Список избранного пуст
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteLocations.map(loc => (
                  <Link href={`/location/${loc.id}`} key={loc.id}>
                    <div className="glass-panel p-4 border-white/5 hover:border-white/10 transition-all flex items-center gap-4 group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                        <img src={loc.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white truncate">{loc.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold text-white">{loc.rating}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </motion.div>
  );
}

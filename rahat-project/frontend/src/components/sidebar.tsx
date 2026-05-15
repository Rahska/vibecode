"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Compass,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Heart,
  User,
  Bell,
  CheckCheck
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRahatStore } from "@/lib/store";

const SIDEBAR_ITEMS = [
  { icon: Compass, label: "Обзор", href: "/" },
  { icon: MapIcon, label: "Карта", href: "/map" },
  { icon: Heart, label: "Избранное", href: "/favorites" },
  { icon: CalendarDays, label: "Мои брони", href: "/bookings" },
  { icon: User, label: "Профиль", href: "/profile" },
  { icon: LayoutDashboard, label: "Управление", href: "/dashboard" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { notifications, profile, bookings, markAllNotificationsRead, markNotificationRead } = useRahatStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const activeBookingsCount = bookings.filter(b => b.status === 'CONFIRMED').length;
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-[280px] h-screen sticky top-0 border-r border-white/5 bg-[#0A0A0A]/80 backdrop-blur-3xl flex-col z-50 hidden md:flex shrink-0"
    >
      <div className="p-8 flex items-center justify-between gap-3 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <span className="font-heading font-bold text-black tracking-tight text-xl">R</span>
          </div>
          <span className="font-heading font-semibold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            RAHAT
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${showNotifs ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadCount > 0 && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-72 bg-[#111827] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-white/5">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">Уведомления</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => { markAllNotificationsRead(); setShowNotifs(false); }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" /> Прочитать все
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">Нет уведомлений</div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => { if (!n.isRead) markNotificationRead(n.id); }}
                        className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${!n.isRead ? 'bg-cyan-500/5 hover:bg-cyan-500/10' : 'hover:bg-white/5'}`}
                      >
                        <div className="flex items-start gap-3">
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />}
                          <div>
                            <div className={`text-sm mb-1 ${!n.isRead ? 'text-white font-semibold' : 'text-slate-300 font-medium'}`}>{n.title}</div>
                            <div className="text-xs text-slate-400 leading-relaxed">{n.message}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link href="/notifications" onClick={() => setShowNotifs(false)} className="block w-full text-center py-3 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors border-t border-white/10">
                  Все уведомления
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1 mt-4">
        <div className="px-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">Меню</div>
        {SIDEBAR_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 border border-transparent ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400 border-l-cyan-500 shadow-[inset_2px_0_0_0_rgba(6,182,212,1)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>

              {item.label === "Мои брони" && activeBookingsCount > 0 && (
                <span className="bg-cyan-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeBookingsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-medium">
          <span>Быстрый поиск</span>
          <kbd className="px-2 py-1 rounded bg-white/10 text-slate-300 font-sans border border-white/10 shadow-sm">Ctrl + K</kbd>
        </div>

        <Link href="/profile" className="flex items-center gap-3 mt-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden border border-white/10 flex-shrink-0">
            {profile.avatar ? (
              <img src={profile.avatar} className="w-full h-full object-cover" alt="Аватар" />
            ) : (
              <User className="w-full h-full p-2 text-slate-400" />
            )}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-white truncate">{profile.name}</div>
            <div className="text-xs text-slate-500 truncate">{profile.email}</div>
          </div>
        </Link>

        <button className="flex items-center gap-3 text-sm text-red-400/80 hover:text-red-400 transition-colors w-full px-4 py-2.5 rounded-xl hover:bg-red-500/10">
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Выйти</span>
        </button>
      </div>
    </motion.aside>
  );
}

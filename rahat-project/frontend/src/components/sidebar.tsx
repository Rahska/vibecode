"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Map as MapIcon,
  Heart,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Settings,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrbitaStore } from "@/lib/store";

const USER_NAV = [
  { icon: Compass, label: "Обзор", href: "/" },
  { icon: MapIcon, label: "Карта", href: "/map" },
  { icon: Heart, label: "Избранное", href: "/favorites" },
];

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: "Панель", href: "/orbita-admin" },
  { icon: CalendarDays, label: "Бронирования", href: "/orbita-admin/bookings" },
  { icon: Settings, label: "Настройки", href: "/orbita-admin/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAdminLoggedIn, logoutAdmin, settings } = useOrbitaStore();
  
  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-[280px] h-screen sticky top-0 border-r border-white/5 bg-[#0A0A0A]/80 backdrop-blur-3xl flex-col z-50 hidden md:flex shrink-0"
    >
      <div className="p-8 flex items-center justify-between gap-3 relative">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)]">
            <span className="font-heading font-bold text-black tracking-tight text-xl">O</span>
          </div>
          <span className="font-heading font-semibold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            {settings.platformName}
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-8 mt-4">
        <div>
          <div className="px-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Навигация</div>
          <div className="flex flex-col gap-1">
            {USER_NAV.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 border border-transparent ${
                    isActive
                      ? "bg-white/5 text-white border-white/5 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {isAdminLoggedIn && (
          <div>
            <div className="px-4 pb-2 text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-2">Администрирование</div>
            <div className="flex flex-col gap-1">
              {ADMIN_NAV.map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 border border-transparent ${
                      isActive
                        ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <div className="p-6 border-t border-white/5">
        {isAdminLoggedIn ? (
          <button
            onClick={() => { logoutAdmin(); window.location.href = '/'; }}
            className="flex items-center gap-3 text-sm text-red-400/80 hover:text-red-400 transition-colors w-full px-4 py-3 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-bold">Выйти из админа</span>
          </button>
        ) : (
          <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Связь с нами</p>
            <p className="text-xs text-white font-medium">{settings.whatsappNumber}</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

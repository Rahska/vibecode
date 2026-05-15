"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  Compass,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Heart,
  User,
  Bell
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRahatStore } from "@/lib/store";

const SIDEBAR_ITEMS = [
  { icon: Compass, label: "Explore", href: "/" },
  { icon: Heart, label: "Favorites", href: "/favorites" },
  { icon: CalendarDays, label: "My Bookings", href: "/bookings" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: LayoutDashboard, label: "Admin Dashboard", href: "/dashboard" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { notifications, profile } = useRahatStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.aside 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-[280px] h-screen sticky top-0 border-r border-white/5 bg-[#0A0A0A]/80 backdrop-blur-3xl flex-col z-50 hidden md:flex shrink-0"
    >
      <div className="p-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <span className="font-heading font-bold text-black tracking-tight text-xl">R</span>
          </div>
          <span className="font-heading font-semibold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            RAHAT
          </span>
        </div>
        
        <div className="relative group">
          <button className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadCount > 0 && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
          
          {/* Notifications Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-[#111827] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
            <div className="text-xs font-semibold text-slate-400 px-2 py-2 mb-1 border-b border-white/10">Notifications</div>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-1">
                {notifications.map(n => (
                  <div key={n.id} className="p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                    <div className="flex items-start gap-2">
                      {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />}
                      <div>
                        <div className="text-sm font-semibold text-white">{n.title}</div>
                        <div className="text-xs text-slate-400 line-clamp-2">{n.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1">
        <div className="px-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">Menu</div>
        {SIDEBAR_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={idx}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? "bg-white/10 text-white shadow-inner border border-white/5" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 flex flex-col gap-4">
        <Link href="/profile" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden border border-white/10">
            {profile.avatar ? (
              <img src={profile.avatar} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <User className="w-full h-full p-2 text-slate-400" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{profile.name}</div>
            <div className="text-xs text-slate-500 truncate w-32">{profile.email}</div>
          </div>
        </Link>
        
        <button className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors w-full px-4 py-2 rounded-xl hover:bg-white/5">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </motion.aside>
  );
}

"use client";

import { Compass, CalendarDays, Heart, LayoutDashboard, Map as MapIcon, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRahatStore } from "@/lib/store";

const NAV_ITEMS = [
  { icon: Compass, label: "Explore", href: "/" },
  { icon: Heart, label: "Favs", href: "/favorites" },
  { icon: MapIcon, label: "Map", href: "/map" },
  { icon: CalendarDays, label: "Bookings", href: "/bookings" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: LayoutDashboard, label: "Admin", href: "/dashboard" },
];

export function MobileNav() {
  const pathname = usePathname();
  const { notifications } = useRahatStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-6 pt-2">
      <div className="glass-panel !rounded-2xl p-2 flex justify-between items-center bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-x-auto hide-scrollbar">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link 
              key={idx}
              href={item.href}
              className={`relative flex flex-col items-center justify-center min-w-[48px] px-1 h-12 rounded-xl transition-all duration-300 ${
                isActive 
                  ? "text-cyan-400 bg-cyan-500/10" 
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[9px] font-medium tracking-tight">{item.label}</span>
              
              {item.label === "Profile" && unreadCount > 0 && (
                <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

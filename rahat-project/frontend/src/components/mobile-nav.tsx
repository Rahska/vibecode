"use client";

import { Compass, CalendarDays, Heart, LayoutDashboard, Map as MapIcon, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { icon: Compass, label: "Explore", href: "/" },
  { icon: Heart, label: "Favorites", href: "/favorites" },
  { icon: MapIcon, label: "Map", href: "/map" },
  { icon: CalendarDays, label: "Bookings", href: "/bookings" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
      <div className="glass-panel !rounded-2xl p-2 flex justify-between items-center bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={idx}
              href={item.href}
              className={`flex flex-col items-center justify-center w-[52px] h-12 rounded-xl transition-all duration-300 ${
                isActive 
                  ? "text-cyan-400 bg-cyan-500/10" 
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

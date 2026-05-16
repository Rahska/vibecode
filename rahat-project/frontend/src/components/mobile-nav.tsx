"use client";

import { Compass, Heart, LayoutDashboard, Map as MapIcon, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrbitaStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { User as UserIcon, LogIn } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const { isAdminLoggedIn } = useOrbitaStore();
  const { user, profile } = useAuthStore();

  const NAV_ITEMS = [
    { icon: Compass, label: "Обзор", href: "/" },
    { icon: MapIcon, label: "Карта", href: "/map" },
    { icon: Heart, label: "Избранное", href: "/favorites" },
  ];

  const isAdmin = profile?.role === 'admin' || isAdminLoggedIn;

  if (isAdmin) {
    NAV_ITEMS.push(
      { icon: LayoutDashboard, label: "Админ", href: "/orbita-admin" }
    );
  }

  // Add Profile or Login as the last item
  if (user) {
    NAV_ITEMS.push({ icon: UserIcon, label: "Профиль", href: "/profile" });
  } else {
    NAV_ITEMS.push({ icon: LogIn, label: "Войти", href: "/login" });
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-6 pt-2">
      <div className="glass-panel !rounded-2xl p-2 flex justify-around items-center bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={idx}
              href={item.href}
              className={`relative flex flex-col items-center justify-center px-1 h-12 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-orange-500 bg-orange-500/10"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[9px] font-medium tracking-tight">{item.label}</span>
              
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

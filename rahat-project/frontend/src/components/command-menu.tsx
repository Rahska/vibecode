"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Compass, Map, Heart, LayoutDashboard, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrbitaStore } from "@/lib/store";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { locations, isAdminLoggedIn } = useOrbitaStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div 
        className="fixed inset-0 z-0" 
        onClick={() => setOpen(false)}
      />
      <div className="w-full max-w-2xl bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <Command label="Orbita Search" className="w-full flex flex-col">
          <div className="flex items-center border-b border-white/10 px-4">
            <Search className="w-5 h-5 text-slate-500" />
            <Command.Input 
              placeholder="Поиск по ОРБИТА..." 
              className="w-full bg-transparent border-none outline-none text-white px-4 py-4 placeholder:text-slate-500"
              autoFocus
            />
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-slate-400 text-sm">Ничего не найдено.</Command.Empty>

            <Command.Group heading="Навигация" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2">
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/'))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer aria-selected:bg-white/5 aria-selected:text-white transition-all"
              >
                <Compass className="w-4 h-4 text-orange-500" /> Обзор каталога
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/map'))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer aria-selected:bg-white/5 aria-selected:text-white transition-all"
              >
                <Map className="w-4 h-4 text-orange-500" /> Карта территории
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/favorites'))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer aria-selected:bg-white/5 aria-selected:text-white transition-all"
              >
                <Heart className="w-4 h-4 text-orange-500" /> Избранные места
              </Command.Item>
            </Command.Group>

            {isAdminLoggedIn && (
              <Command.Group heading="Администрирование" className="text-[10px] font-bold text-orange-500/50 uppercase tracking-widest px-3 py-2 mt-2">
                <Command.Item 
                  onSelect={() => runCommand(() => router.push('/orbita-admin'))}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer aria-selected:bg-white/5 aria-selected:text-white transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" /> Панель управления
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push('/orbita-admin/settings'))}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer aria-selected:bg-white/5 aria-selected:text-white transition-all"
                >
                  <Settings className="w-4 h-4" /> Настройки системы
                </Command.Item>
              </Command.Group>
            )}

            <Command.Group heading="Места" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2 mt-2">
              {(locations || []).map(loc => (
                <Command.Item 
                  key={loc.id}
                  onSelect={() => runCommand(() => router.push(`/location/${loc.id}`))}
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer aria-selected:bg-white/5 aria-selected:text-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10">
                      <img src={loc.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    {loc.name}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-md">{loc.type}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

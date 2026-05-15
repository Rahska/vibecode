"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Compass, CalendarDays, Heart, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRahatStore } from "@/lib/store";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locations = useRahatStore(state => state.locations);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
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
        <Command label="Global Command Menu" className="w-full flex flex-col">
          <div className="flex items-center border-b border-white/10 px-4">
            <Search className="w-5 h-5 text-slate-400" />
            <Command.Input 
              placeholder="Search locations, pages, or actions..." 
              className="w-full bg-transparent border-none outline-none text-white px-4 py-4 placeholder:text-slate-500"
              autoFocus
            />
          </div>
          
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-slate-400 text-sm">No results found.</Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-semibold text-slate-500 px-2 py-2">
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/'))}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
              >
                <Compass className="w-4 h-4" /> Explore Catalog
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/favorites'))}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
              >
                <Heart className="w-4 h-4" /> My Favorites
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/bookings'))}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
              >
                <CalendarDays className="w-4 h-4" /> My Bookings
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/dashboard'))}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
              >
                <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Locations" className="text-xs font-semibold text-slate-500 px-2 py-2 mt-2">
              {locations.map(loc => (
                <Command.Item 
                  key={loc.id}
                  onSelect={() => runCommand(() => router.push(`/location/${loc.id}`))}
                  className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer aria-selected:bg-white/10 aria-selected:text-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded overflow-hidden">
                      <img src={loc.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    {loc.name}
                  </div>
                  <span className="text-xs text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded">{loc.type}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

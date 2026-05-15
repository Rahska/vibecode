"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  Compass,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Settings,
  Star,
  Users
} from "lucide-react";
import { useState } from "react";

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Compass, label: "Explore" },
  { icon: CalendarDays, label: "Bookings" },
  { icon: MessageSquare, label: "Messages" },
  { icon: CreditCard, label: "Payments" },
  { icon: Settings, label: "Settings" },
];

const LOCATIONS = [
  {
    name: "Royal Yurt V1",
    type: "Premium Yurt",
    price: "$50",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1000&auto=format&fit=crop",
    glow: "glow-cyan"
  },
  {
    name: "Sky Lounge Tapchan",
    type: "VIP Zone",
    price: "$85",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000&auto=format&fit=crop",
    glow: "glow-blue"
  },
  {
    name: "Forest Gazebo",
    type: "Classic Area",
    price: "$30",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1499803270242-467f73115827?q=80&w=1000&auto=format&fit=crop",
    glow: "glow-cyan"
  }
];

export default function Home() {
  const [hoveredLocation, setHoveredLocation] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex w-full relative overflow-hidden text-slate-200">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Sidebar (Linear Style) */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-[280px] h-screen sticky top-0 border-r border-white/5 bg-[#0A0A0A]/80 backdrop-blur-3xl flex flex-col z-20 hidden md:flex"
      >
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <span className="font-heading font-bold text-black tracking-tight text-xl">R</span>
          </div>
          <span className="font-heading font-semibold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            RAHAT
          </span>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1">
          <div className="px-4 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">Menu</div>
          {SIDEBAR_ITEMS.map((item, idx) => (
            <button 
              key={idx}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                item.active 
                  ? "bg-white/10 text-white shadow-inner border border-white/5" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6">
          <button className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors w-full px-4 py-2 rounded-xl hover:bg-white/5">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-14 overflow-y-auto z-10 w-full">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-12 gap-6"
        >
          <div>
            <h1 className="text-4xl lg:text-5xl font-semibold mb-2 text-white">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Alex</span>
            </h1>
            <p className="text-slate-400 text-lg">Find your perfect getaway for the weekend.</p>
          </div>
          
          <div className="glass-panel px-6 py-3 flex items-center gap-4 w-fit">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            <span className="text-sm font-medium text-white">12 Locations Available</span>
          </div>
        </motion.header>

        {/* Hero Booking Widget (Glassmorphism + Neon) */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass-panel p-2 mb-12 flex flex-col lg:flex-row items-center gap-2"
        >
          <div className="flex-1 w-full px-6 py-4 rounded-[1.25rem] hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
            <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Location</div>
            <div className="font-medium text-white text-lg">Where are you going?</div>
          </div>
          <div className="w-full lg:w-px h-px lg:h-12 bg-white/10" />
          <div className="flex-1 w-full px-6 py-4 rounded-[1.25rem] hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
            <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Date</div>
            <div className="font-medium text-white text-lg">Select Date</div>
          </div>
          <div className="w-full lg:w-px h-px lg:h-12 bg-white/10" />
          <div className="flex-1 w-full px-6 py-4 rounded-[1.25rem] hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
            <div className="text-xs text-slate-400 uppercase font-semibold mb-1">Time Slots</div>
            <div className="font-medium text-slate-500 text-lg">Add Hours</div>
          </div>
          <button className="w-full lg:w-auto h-[72px] px-8 rounded-[1.25rem] bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold flex justify-center items-center gap-2 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 group">
            <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            Search
          </button>
        </motion.div>

        {/* Recommendations Section */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-white">Premium Destinations</h2>
          <button className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {LOCATIONS.map((loc, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
              onMouseEnter={() => setHoveredLocation(idx)}
              onMouseLeave={() => setHoveredLocation(null)}
              className={`glass-card ${loc.glow} p-3 cursor-pointer group`}
            >
              <div className="relative w-full h-[240px] rounded-xl overflow-hidden mb-4">
                <img 
                  src={loc.image} 
                  alt={loc.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
                <div className="absolute top-3 right-3 glass-panel !rounded-full px-3 py-1 !border-white/10 flex items-center gap-1 bg-black/40">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-white">{loc.rating}</span>
                </div>
              </div>
              <div className="px-2 pb-2">
                <div className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  {loc.type}
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-white">{loc.name}</h3>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white">{loc.price}</span>
                    <span className="text-xs text-slate-400">/hr</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Users className="w-4 h-4" /> 
                  <span>Up to 10 guests</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

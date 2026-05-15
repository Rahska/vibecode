"use client";

import { motion } from "framer-motion";
import { useRahatStore } from "@/lib/store";
import { MapPin, Info, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function MapPage() {
  const { locations } = useRahatStore();
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  // Hardcoded coordinates on a 100x100 grid (percentages) to simulate 2D map
  const mapCoordinates: Record<string, { x: number, y: number, color: string }> = {
    '1': { x: 20, y: 30, color: 'bg-cyan-500' }, // Royal Yurt
    '2': { x: 70, y: 40, color: 'bg-blue-500' }, // Sky Lounge
    '3': { x: 45, y: 70, color: 'bg-green-500' }, // Forest Gazebo
  };

  return (
    <div className="p-6 lg:p-14 w-full h-full flex flex-col">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-4xl lg:text-5xl font-semibold mb-2 text-white">
          Interactive <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">Map</span>
        </h1>
        <p className="text-slate-400 text-lg">Explore the territory and find your perfect spot.</p>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex-1 glass-panel rounded-3xl relative overflow-hidden bg-[#0A0A0A]/50 border-white/5 min-h-[600px]"
      >
        {/* Fake map background lines to make it look like a blueprint/territory plan */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Territory Elements (Lake, Trees) */}
        <div className="absolute top-[10%] right-[15%] w-[30%] h-[25%] bg-blue-500/10 rounded-[100px] blur-2xl pointer-events-none" />
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[30%] bg-emerald-500/10 rounded-[100px] blur-2xl pointer-events-none" />

        {/* Map Markers */}
        {locations.map((loc) => {
          const coords = mapCoordinates[loc.id] || { x: 50, y: 50, color: 'bg-white' };
          const isHovered = hoveredLocation === loc.id;
          
          return (
            <div 
              key={loc.id}
              className="absolute group z-10"
              style={{ left: `${coords.x}%`, top: `${coords.y}%`, transform: 'translate(-50%, -50%)' }}
              onMouseEnter={() => setHoveredLocation(loc.id)}
              onMouseLeave={() => setHoveredLocation(null)}
            >
              {/* Ping Animation */}
              <div className={`absolute inset-0 rounded-full ${coords.color} opacity-20 animate-ping`} />
              
              {/* Marker Pin */}
              <div className={`relative w-8 h-8 rounded-full ${coords.color} flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-125 transition-transform`}>
                <MapPin className="w-4 h-4 text-black" />
              </div>

              {/* Tooltip Card */}
              {isHovered && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 glass-card p-3 shadow-2xl z-50 pointer-events-none"
                >
                  <div className="w-full h-24 rounded-lg overflow-hidden mb-3">
                    <img src={loc.images[0]} alt={loc.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold leading-tight">{loc.name}</h3>
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">${loc.pricePerHour}/hr</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-400 gap-1 mb-3">
                    <Info className="w-3 h-3" />
                    <span>Up to {loc.capacity} guests</span>
                  </div>
                  <Link href={`/location/${loc.id}`} className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1 pointer-events-auto hover:bg-slate-200 transition-colors">
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

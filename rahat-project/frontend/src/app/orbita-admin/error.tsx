"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console
    console.error("Runtime Admin Error caught by Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0A0A0A]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-panel p-10 flex flex-col items-center text-center relative overflow-hidden border-red-500/20"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />

        <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Произошла ошибка</h1>
        <p className="text-slate-400 mb-8 font-medium">
          При работе панели управления возникла непредвиденная ошибка. Мы уже зафиксировали её.
        </p>

        {error.message && (
          <div className="w-full p-4 bg-white/5 border border-white/10 rounded-xl mb-8 text-left text-xs font-mono text-slate-400 max-h-32 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 h-14 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
          >
            <RefreshCw className="w-5 h-5" /> Повторить попытку
          </button>
          
          <Link
            href="/"
            className="flex-1 h-14 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <Home className="w-5 h-5" /> На главную
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 w-full">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Orbita Admin Recovery System
          </p>
        </div>
      </motion.div>
    </div>
  );
}

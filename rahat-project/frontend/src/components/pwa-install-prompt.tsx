"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if the user hasn't explicitly dismissed it recently (optional)
      const hasDismissed = localStorage.getItem("pwa-dismissed");
      if (!hasDismissed) {
        setTimeout(() => setShowPrompt(true), 3000); // delay prompt slightly
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-dismissed", "true");
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:w-80"
        >
          <div className="glass-panel p-4 rounded-2xl flex items-start gap-4 shadow-2xl border-white/10 bg-[#0a0a0a]/95">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-[#0a0a0a] rounded-[10px] flex items-center justify-center">
                <span className="text-orange-500 font-bold text-xl">O</span>
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm mb-1">Приложение ORBITA</h4>
              <p className="text-xs text-slate-400 mb-3">Установите для быстрого доступа к бронированию.</p>
              <div className="flex gap-2">
                <button 
                  onClick={handleInstall}
                  className="flex-1 py-1.5 bg-orange-500 text-black text-xs font-bold rounded-lg hover:bg-orange-400 transition-colors flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" /> Установить
                </button>
              </div>
            </div>

            <button 
              onClick={handleDismiss}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

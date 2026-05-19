"use client";

import { useOrbitaStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function WhatsAppFloatingButton() {
  const { settings, isAdminLoggedIn } = useOrbitaStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show button after a small delay for premium entrance feel
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Don't show floating button on admin pages to keep admin UI clean
  if (isAdminLoggedIn) return null;

  const handleOpenWhatsApp = () => {
    const number = settings?.whatsappNumber || "77001234567";
    const text = encodeURIComponent(settings?.whatsappMessage || "Здравствуйте! Хочу забронировать место в ОРБИТА.");
    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-28 md:bottom-8 right-6 z-40">
          <div className="relative group">
            {/* Pulsating premium green ring behind the button */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-[8px] animate-ping pointer-events-none" />
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Premium tooltip/badge */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#0A0A0A]/95 border border-white/10 backdrop-blur-md px-4 py-2 rounded-2xl whitespace-nowrap text-xs font-bold text-white shadow-2xl transition-all duration-300 opacity-0 scale-90 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 hidden sm:block">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Напишите нам в WhatsApp
              </span>
            </div>

            {/* The main button */}
            <motion.button
              onClick={handleOpenWhatsApp}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/20 cursor-pointer relative z-10 hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all duration-300"
            >
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.019 14.12 1 11.999 1c-5.438 0-9.863 4.37-9.867 9.8-.001 1.767.469 3.5 1.359 5.022L2.483 20.31l4.164-1.156zM17.84 14.88c-.324-.162-1.92-.947-2.217-1.055-.298-.108-.515-.162-.73.162-.216.324-.836 1.055-1.025 1.27-.19.216-.379.243-.703.08-1.58-.79-2.735-1.37-3.826-2.296-.288-.244-.457-.546-.541-.87-.084-.324.237-.58.468-.813.12-.12.269-.324.378-.459.081-.108.135-.189.189-.324.054-.135.027-.243-.014-.324-.04-.081-.513-1.298-.703-1.758-.185-.445-.37-.384-.513-.391-.133-.007-.285-.007-.438-.007-.153 0-.405.057-.617.291-.212.234-.81.791-.81 1.929 0 1.137.828 2.239.941 2.392.113.153 1.63 2.49 3.95 3.493.552.239.983.381 1.32.488.555.176 1.06.151 1.46.091.446-.067 1.36-.554 1.55-1.088.19-.534.19-1.02.133-1.115-.057-.095-.213-.153-.538-.315z"/>
              </svg>
            </motion.button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

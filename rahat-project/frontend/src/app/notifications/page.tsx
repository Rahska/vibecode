"use client";

import { useRahatStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useRahatStore();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 lg:p-14 w-full max-w-4xl mx-auto">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl lg:text-5xl font-semibold mb-2 text-white flex items-center gap-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Уведомления</span>
            {unreadCount > 0 && (
              <span className="text-xl px-3 py-1 bg-cyan-500 text-black font-bold rounded-full">
                {unreadCount} новых
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-lg">Следите за бронями и активностью.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-colors w-fit"
          >
            <CheckCheck className="w-5 h-5 text-cyan-400" />
            Прочитать все
          </button>
        )}
      </motion.header>

      {notifications.length === 0 ? (
        <div className="glass-panel p-16 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Bell className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Всё прочитано!</h3>
          <p className="text-slate-400 mb-8 max-w-md">Нет новых уведомлений. Они появятся при бронировании или обновлении аккаунта.</p>
          <Link href="/" className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 transition-colors">
            К каталогу
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => { if (!notif.isRead) markNotificationRead(notif.id); }}
                className={`glass-card p-6 flex items-start gap-4 cursor-pointer transition-colors ${
                  !notif.isRead ? 'border-l-4 border-l-cyan-500 bg-cyan-500/5' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !notif.isRead ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-400'
                }`}>
                  <Bell className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-lg ${!notif.isRead ? 'font-bold text-white' : 'font-semibold text-slate-300'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap ml-4">
                      {new Date(notif.createdAt).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-slate-300' : 'text-slate-500'}`}>
                    {notif.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

"use client";

import { useOrbitaStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2,
  Settings as SettingsIcon,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import Link from "next/link";

const data = [
  { name: 'Пн', bookings: 12, revenue: 180000 },
  { name: 'Вт', bookings: 19, revenue: 240000 },
  { name: 'Ср', bookings: 15, revenue: 210000 },
  { name: 'Чт', bookings: 22, revenue: 320000 },
  { name: 'Пт', bookings: 30, revenue: 450000 },
  { name: 'Сб', bookings: 45, revenue: 720000 },
  { name: 'Вс', bookings: 38, revenue: 580000 },
];

export default function AdminPage() {
  const { 
    isAdminLoggedIn, 
    loginAdmin, 
    locations, 
    bookings, 
    reviews, 
    settings,
    deleteLocation,
    deleteReview
  } = useOrbitaStore();
  
  const [pin, setPin] = useState("");
  const [activeTab, setActiveTab] = useState<'STATS' | 'LOCATIONS' | 'REVIEWS'>('STATS');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pin)) {
      toast.success("Добро пожаловать, администратор!");
    } else {
      toast.error("Неверный PIN-код");
      setPin("");
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass-panel p-10 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-rose-500" />
          
          <div className="w-20 h-20 rounded-[2rem] bg-orange-500/10 flex items-center justify-center mb-8 border border-orange-500/20">
            <Lock className="w-10 h-10 text-orange-500" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">ORBITA ADMIN</h1>
          <p className="text-slate-500 mb-8 font-medium">Введите секретный PIN для доступа</p>

          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-3xl tracking-[0.5em] text-white outline-none focus:border-orange-500/50 transition-all font-bold"
                autoFocus
                maxLength={4}
              />
            </div>
            <button
              type="submit"
              className="w-full h-14 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
            >
              Войти в панель <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 w-full">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Orbita Security System v1.0</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalRevenue = bookings.filter(b => b.status === 'CONFIRMED').reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className="p-6 lg:p-14 w-full max-w-7xl mx-auto">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Админ Панель</h1>
          <p className="text-slate-400">Управление платформой {settings.platformName}</p>
        </div>

        <div className="flex gap-3">
          <Link href="/orbita-admin/settings" className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
            <SettingsIcon className="w-5 h-5" />
          </Link>
          <button className="px-6 py-3.5 bg-orange-500 text-black font-bold rounded-xl flex items-center gap-2 hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20">
            <Plus className="w-5 h-5" /> Создать бронь
          </button>
        </div>
      </motion.header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Выручка', value: `${settings.currency}${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Бронирования', value: bookings.length, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Локации', value: locations.length, icon: ShieldCheck, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Отзывы', value: reviews.length, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 border-white/5"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 min-h-[400px] border-white/5">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white">Статистика доходов</h3>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none">
                <option>Последние 7 дней</option>
                <option>Месяц</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Locations Table */}
          <div className="glass-panel p-8 border-white/5">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white">Управление локациями</h3>
              <button className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors">Смотреть все</button>
            </div>
            <div className="space-y-4">
              {locations.map(loc => (
                <div key={loc.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden">
                      <img src={loc.images[0]} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{loc.name}</h4>
                      <p className="text-xs text-slate-500">{settings.currency}{loc.pricePerHour.toLocaleString()}/ч • {loc.capacity} чел.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteLocation(loc.id)}
                      className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-8">
          <div className="glass-panel p-8 border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">Последние отзывы</h3>
            <div className="space-y-6">
              {reviews.slice(0, 5).map(review => {
                const loc = locations.find(l => l.id === review.locationId);
                return (
                  <div key={review.id} className="pb-6 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-bold text-white">{review.author}</div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <ShieldCheck key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-orange-400 fill-orange-400' : 'text-slate-600'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{review.text}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-orange-500/50 uppercase">{loc?.name}</span>
                      <button onClick={() => deleteReview(review.id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel p-8 border-white/5 bg-orange-500/5">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-400" /> Статус системы
            </h3>
            <p className="text-sm text-slate-400 mb-6">Все системы работают стабильно. Резервное копирование завершено успешно.</p>
            <div className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Загрузка сервера</span>
                <span className="text-emerald-400 font-bold">12%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[12%] h-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

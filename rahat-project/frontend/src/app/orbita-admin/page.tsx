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
  MessageSquare,
  Activity as ActivityIcon,
  Star,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { LocationEditorModal } from "@/components/admin/location-editor-modal";
import { Location } from "@/lib/store";

const chartData = [
  { name: 'Пн', bookings: 12, revenue: 180000 },
  { name: 'Вт', bookings: 19, revenue: 240000 },
  { name: 'Ср', bookings: 15, revenue: 210000 },
  { name: 'Чт', bookings: 22, revenue: 320000 },
  { name: 'Пт', bookings: 30, revenue: 450000 },
  { name: 'Сб', bookings: 45, revenue: 720000 },
  { name: 'Вс', bookings: 38, revenue: 580000 },
];

function formatRevenue(value: number, currency: string): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M ${currency}`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K ${currency}`;
  }
  return `${currency}${value.toLocaleString()}`;
}

export default function AdminPage() {
  const router = useRouter();
  const {
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    fetchAdminData,
    locations,
    bookings,
    reviews,
    settings,
    deleteLocation,
    deleteReview,
    activities
  } = useOrbitaStore();

  const [pin, setPin] = useState("");
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [pinError, setPinError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAdminLoggedIn) {
      fetchAdminData();
    }
  }, [isAdminLoggedIn, fetchAdminData, mounted]);

  if (!mounted) {
    return (
      <div className="p-4 md:p-6 lg:p-14 w-full flex items-center justify-center min-h-[60vh] bg-[#0A0A0A]">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pin)) {
      toast.success("Добро пожаловать, администратор!");
      setPinError(false);
    } else {
      toast.error("Неверный PIN-код");
      setPin("");
      setPinError(true);
      setTimeout(() => setPinError(false), 1000);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    router.push('/');
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-md glass-panel p-10 flex flex-col items-center text-center relative overflow-hidden transition-all ${pinError ? 'border-red-500/30' : ''}`}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-rose-500" />

          <motion.div
            animate={pinError ? { x: [-8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 rounded-[2rem] bg-orange-500/10 flex items-center justify-center mb-8 border border-orange-500/20"
          >
            <Lock className="w-10 h-10 text-orange-500" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2">ORBITA ADMIN</h1>
          <p className="text-slate-500 mb-8 font-medium">Введите секретный PIN для доступа</p>

          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className={`w-full h-16 bg-white/5 border rounded-2xl text-center text-3xl tracking-[0.5em] text-white outline-none transition-all font-bold ${pinError ? 'border-red-500/50' : 'border-white/10 focus:border-orange-500/50'}`}
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
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Orbita Security System v2.0</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalRevenue = (bookings || []).filter(b => b.status === 'CONFIRMED').reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  const stats = [
    { label: 'Выручка', value: formatRevenue(totalRevenue, settings?.currency || '₸'), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Бронирования', value: (bookings || []).length, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Локации', value: (locations || []).length, icon: ShieldCheck, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Отзывы', value: (reviews || []).length, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-12 w-full max-w-7xl mx-auto">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Админ Панель</h1>
          <p className="text-slate-400">Управление платформой {settings?.platformName}</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link href="/orbita-admin/settings" className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
            <SettingsIcon className="w-5 h-5" />
          </Link>
          <Link href="/orbita-admin/bookings" className="px-5 py-3 bg-orange-500 text-black font-bold rounded-xl flex items-center gap-2 hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20">
            <Plus className="w-5 h-5" /> Создать бронь
          </Link>
          <button
            onClick={handleLogout}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-panel p-5 border-white/5 hover:border-white/10 transition-all duration-300 group cursor-default`}
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-xl md:text-2xl font-bold text-white break-all leading-tight">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Статистика доходов</h3>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none">
                <option>Последние 7 дней</option>
                <option>Месяц</option>
              </select>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(v) => [`₸${Number(v).toLocaleString()}`, 'Выручка']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Locations Table */}
          <div className="glass-panel p-6 border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Управление локациями</h3>
              <span className="text-xs text-slate-500">{(locations || []).length} мест</span>
            </div>
            <div className="space-y-3">
              {(locations || []).map(loc => (
                <div key={loc.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <img src={loc.images?.[0]} className="w-full h-full object-cover" alt={loc.name} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{loc.name}</h4>
                      <p className="text-xs text-slate-500">{settings?.currency}{loc.pricePerHour.toLocaleString()}/ч • {loc.capacity} чел.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingLocation(loc)}
                      className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { deleteLocation(loc.id); toast.success("Локация удалена"); }}
                      className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Latest Reviews */}
          <div className="glass-panel p-6 border-white/5">
            <h3 className="text-lg font-bold text-white mb-5">Последние отзывы</h3>
            <div className="space-y-4">
              {(reviews || []).slice(0, 5).map(review => {
                const loc = (locations || []).find(l => l.id === review.locationId);
                return (
                  <div key={review.id} className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="text-sm font-bold text-white">{review.author}</div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-1.5 line-clamp-2">{review.text}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-orange-500/50 uppercase truncate mr-2">{loc?.name}</span>
                      <button onClick={() => { deleteReview(review.id); toast.success("Отзыв удалён"); }} className="text-red-400 hover:text-red-300 transition-colors shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {(reviews || []).length === 0 && <p className="text-xs text-slate-500">Нет отзывов</p>}
            </div>
          </div>

          {/* Activity */}
          <div className="glass-panel p-6 border-white/5">
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-blue-400" /> История действий
            </h3>
            <div className="space-y-3">
              {(activities || []).slice(0, 5).map(activity => (
                <div key={activity.id} className="pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <p className="text-xs text-white mb-0.5">{activity.message}</p>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">{activity.time}</span>
                </div>
              ))}
              {(activities || []).length === 0 && <p className="text-xs text-slate-500">Нет действий</p>}
            </div>
          </div>

          {/* System Status */}
          <div className="glass-panel p-6 border-white/5 bg-emerald-500/5">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Статус системы
            </h3>
            <p className="text-sm text-slate-400 mb-4">Все системы работают стабильно.</p>
            <div className="space-y-3">
              {[
                { label: 'Сервер', value: 12, color: 'bg-emerald-500' },
                { label: 'База данных', value: 8, color: 'bg-emerald-500' },
                { label: 'Хранилище', value: 34, color: 'bg-blue-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-emerald-400 font-bold">{item.value}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <LocationEditorModal
        isOpen={!!editingLocation}
        location={editingLocation}
        onClose={() => setEditingLocation(null)}
      />
    </div>
  );
}

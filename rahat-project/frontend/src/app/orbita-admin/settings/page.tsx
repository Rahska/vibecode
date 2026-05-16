"use client";

import { useOrbitaStore, AppSettings } from "@/lib/store";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Save, 
  Phone, 
  MapPin, 
  Clock, 
  Globe, 
  MessageSquare,
  DollarSign,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminSettings() {
  const { settings, updateSettings, isAdminLoggedIn } = useOrbitaStore();
  const router = useRouter();

  const [formData, setFormData] = useState<AppSettings>(settings);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      router.replace('/orbita-admin');
    }
  }, [isAdminLoggedIn, router]);

  if (!isAdminLoggedIn) return null;

  const handleSave = () => {
    updateSettings(formData);
    toast.success("Настройки успешно сохранены!");
  };

  const handleChange = (key: keyof AppSettings, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 lg:p-14 w-full max-w-4xl mx-auto">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12 flex items-center justify-between"
      >
        <div>
          <Link href="/orbita-admin" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" /> Назад в панель
          </Link>
          <h1 className="text-4xl font-bold text-white">Настройки платформы</h1>
        </div>
        <button
          onClick={handleSave}
          className="px-8 py-3.5 bg-white text-black font-bold rounded-2xl flex items-center gap-2 hover:bg-slate-200 transition-all shadow-xl shadow-white/10"
        >
          <Save className="w-5 h-5" /> Сохранить
        </button>
      </motion.header>

      <div className="space-y-8">
        {/* Основные настройки */}
        <div className="glass-panel p-8 border-white/5">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <Globe className="w-5 h-5 text-orange-500" /> Основная информация
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Название базы</label>
              <input 
                type="text" 
                value={formData.platformName}
                onChange={(e) => handleChange('platformName', e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-orange-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Адрес</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Время работы</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={formData.workingHours}
                  onChange={(e) => handleChange('workingHours', e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Валюта</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Настройки */}
        <div className="glass-panel p-8 border-white/5">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <Phone className="w-5 h-5 text-emerald-500" /> Настройки WhatsApp
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Номер администратора (только цифры)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={formData.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="77001234567"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Шаблон сообщения</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                <textarea 
                  value={formData.whatsappMessage}
                  onChange={(e) => handleChange('whatsappMessage', e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-orange-500/50 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Безопасность */}
        <div className="glass-panel p-8 border-white/5 bg-red-500/5">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500" /> Безопасность
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">PIN-код для входа в админку</label>
              <input 
                type="text" 
                value={formData.adminPin}
                onChange={(e) => handleChange('adminPin', e.target.value.slice(0, 4))}
                placeholder="7777"
                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-red-500/50 transition-all font-bold tracking-[1em]"
              />
              <p className="text-[10px] text-red-400/50 font-medium ml-1 mt-1">Осторожно: изменение PIN-кода вступит в силу немедленно.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

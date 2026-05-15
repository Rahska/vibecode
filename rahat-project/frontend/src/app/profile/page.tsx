"use client";

import { useRahatStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Camera, Save, User, CalendarDays, Star, MessageSquare } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { profile, updateProfile, addNotification, bookings, reviews: allReviews, locations } = useRahatStore();

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [bio, setBio] = useState(profile.bio || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userReviews = allReviews.filter(r => r.author === profile.name);
  const confirmedBookingsCount = bookings.filter(b => b.status === 'CONFIRMED').length;

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Имя не может быть пустым");
      return;
    }
    updateProfile({ name, phone, email, bio });
    addNotification({ title: 'Профиль обновлён', message: 'Ваши данные успешно сохранены.' });
    toast.success("Профиль сохранён");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Файл слишком большой. Максимум 5 МБ.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        updateProfile({ avatar: base64 });
        toast.success("Фото обновлено");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 lg:p-14 w-full max-w-5xl mx-auto"
    >
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-4xl lg:text-5xl font-semibold mb-2 text-white">
          Ваш <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-500">Профиль</span>
        </h1>
        <p className="text-slate-400 text-lg">Личные данные и настройки аккаунта.</p>
      </motion.header>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="glass-card p-4 sm:p-6 text-center border-t-2 border-t-cyan-500">
          <CalendarDays className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{confirmedBookingsCount}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Брони</div>
        </div>
        <div className="glass-card p-4 sm:p-6 text-center border-t-2 border-t-yellow-500">
          <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{userReviews.length}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Отзывы</div>
        </div>
        <div className="glass-card p-4 sm:p-6 text-center border-t-2 border-t-purple-500">
          <User className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{profile.memberSince || '2026'}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">С нами с</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Аватар */}
        <div className="md:col-span-1 flex flex-col items-center">
          <div className="relative group mb-6">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/10 bg-white/5 flex items-center justify-center relative z-10">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Аватар" className="w-full h-full object-cover" />
              ) : (
                <User className="w-20 h-20 text-slate-500" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-cyan-500 text-black flex items-center justify-center hover:scale-110 transition-transform z-20 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <h2 className="text-2xl font-bold text-white text-center">{profile.name}</h2>
          <p className="text-slate-400 text-center">{profile.email}</p>
        </div>

        {/* Форма */}
        <div className="md:col-span-2 space-y-8">
          <div className="glass-panel p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Личная информация</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Телефон</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 700 000 0000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">О себе</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Расскажите о себе..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                className="mt-2 px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Сохранить
              </button>
            </div>
          </div>

          {/* Мои отзывы */}
          <div className="glass-panel p-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-500" /> Мои отзывы
            </h3>

            {userReviews.length === 0 ? (
              <p className="text-slate-400 text-sm">Вы ещё не оставляли отзывов.</p>
            ) : (
              <div className="space-y-4">
                {userReviews.slice(0, 3).map(review => {
                  const loc = locations.find(l => l.id === review.locationId);
                  return (
                    <div key={review.id} className="p-4 rounded-xl border border-white/5 bg-white/5 hover:border-white/20 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/location/${review.locationId}`} className="font-semibold text-white hover:text-cyan-400 transition-colors">
                          {loc?.name || 'Удалённое место'}
                        </Link>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-2 line-clamp-2">{review.text}</p>
                      <div className="text-xs text-slate-500">{review.date}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

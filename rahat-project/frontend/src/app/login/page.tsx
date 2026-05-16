"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrbitaStore } from "@/lib/store";
import { toast } from "sonner";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { loginAdmin } = useOrbitaStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Artificial delay for luxury feel
    await new Promise(r => setTimeout(r, 800));

    const success = loginAdmin(pin);

    if (success) {
      toast.success("Доступ разрешен. Добро пожаловать, администратор.");
      router.push("/orbita-admin");
      router.refresh();
    } else {
      toast.error("Неверный PIN-код доступа");
      setPin("");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0A0A0A] relative">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-10 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-rose-500" />
        
        <div className="w-20 h-20 rounded-[2rem] bg-orange-500/10 flex items-center justify-center mb-8 border border-orange-500/20">
          <Shield className="w-10 h-10 text-orange-500" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Админ-панель</h1>
        <p className="text-slate-500 mb-8 font-medium">Введите PIN-код для входа в управление</p>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Код доступа</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                maxLength={4}
                autoFocus
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white text-2xl tracking-[1em] outline-none focus:border-orange-500/50 transition-all text-center"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Войти <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <button 
          onClick={() => router.push('/')}
          className="mt-8 text-slate-500 text-sm hover:text-white transition-colors"
        >
          Вернуться на сайт
        </button>
      </motion.div>
    </div>
  );
}

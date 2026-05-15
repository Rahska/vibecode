"use client";

import { useRahatStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Camera, Save, User } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { profile, updateProfile, addNotification } = useRahatStore();
  
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateProfile({ name, phone, email });
    addNotification({ title: 'Profile Updated', message: 'Your profile information has been successfully saved.' });
    toast.success("Profile saved successfully");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        updateProfile({ avatar: base64 });
        toast.success("Avatar updated");
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
          Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-500">Profile</span>
        </h1>
        <p className="text-slate-400 text-lg">Manage your personal information and preferences.</p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1 flex flex-col items-center">
          <div className="relative group mb-6">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/10 bg-white/5 flex items-center justify-center relative z-10">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
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

        <div className="md:col-span-2 glass-panel p-8">
          <h3 className="text-xl font-semibold text-white mb-6">Personal Information</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            <button 
              onClick={handleSave}
              className="mt-8 px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Plus, Trash2, Save, MapPin } from "lucide-react";
import { Location, useOrbitaStore } from "@/lib/store";
import { toast } from "sonner";

interface LocationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
}

export function LocationEditorModal({ isOpen, onClose, location }: LocationEditorModalProps) {
  const { updateLocation, addActivity } = useOrbitaStore();
  
  // Local state for editing
  const [formData, setFormData] = useState<Partial<Location>>(
    location || {
      name: "",
      description: "",
      pricePerHour: 0,
      capacity: 0,
      type: "YURT",
      isActive: true,
      images: [],
      features: [],
      x: 50,
      y: 50,
    }
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update formData when location changes
  if (location && formData.id !== location.id) {
    setFormData(location);
  }

  // Autosave
  useEffect(() => {
    if (!formData.id) return;
    const id = formData.id;
    const timer = setTimeout(() => {
      updateLocation(id, formData);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData, updateLocation]);

  const handleChange = (key: keyof Location, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`Файл ${file.name} слишком большой`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), base64String],
        }));
      };
      reader.readAsDataURL(file);
    });
    if (acceptedFiles.length > 0) {
      toast.success("Фото загружено");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true
  });

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }));
  };

  const handleClose = () => {
    if (formData.id) {
      addActivity(`Обновлена локация: ${formData.name}`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel border border-white/10 rounded-2xl shadow-2xl bg-[#0a0a0a]/90 hide-scrollbar"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white">Редактирование локации</h2>
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 transition-colors rounded-lg hover:bg-white/5 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Autosave indicator */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold flex items-center gap-1.5 opacity-50">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Автосохранение включено
            </div>

            <div className="p-6 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Название</label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full h-12 px-4 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:border-orange-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Тип</label>
                  <select
                    value={formData.type || "YURT"}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="w-full h-12 px-4 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:border-orange-500/50"
                  >
                    <option value="YURT" className="bg-[#111]">Юрта</option>
                    <option value="VIP" className="bg-[#111]">VIP Тапчан</option>
                    <option value="GAZEBO" className="bg-[#111]">Беседка</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Цена за час (₸)</label>
                  <input
                    type="number"
                    value={formData.pricePerHour || 0}
                    onChange={(e) => handleChange("pricePerHour", Number(e.target.value))}
                    className="w-full h-12 px-4 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:border-orange-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Вместимость (чел.)</label>
                  <input
                    type="number"
                    value={formData.capacity || 0}
                    onChange={(e) => handleChange("capacity", Number(e.target.value))}
                    className="w-full h-12 px-4 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:border-orange-500/50"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Описание</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full p-4 text-white transition-all border outline-none resize-none bg-white/5 border-white/10 rounded-xl focus:border-orange-500/50"
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 p-4 border bg-white/5 border-white/5 rounded-xl">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive || false} 
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="w-5 h-5 accent-orange-500"
                />
                <label htmlFor="isActive" className="font-bold text-white cursor-pointer">Активна (доступна для брони)</label>
              </div>

              {/* Map Coordinates */}
              <div className="p-4 border bg-white/5 border-white/5 rounded-xl">
                <h4 className="flex items-center gap-2 mb-4 font-bold text-white">
                  <MapPin className="w-4 h-4 text-orange-500" /> Позиция на карте (%)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">X (По горизонтали)</label>
                    <input type="number" value={formData.x || 0} onChange={(e) => handleChange("x", Number(e.target.value))} className="w-full h-10 px-3 mt-1 text-white border bg-white/5 border-white/10 rounded-xl" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Y (По вертикали)</label>
                    <input type="number" value={formData.y || 0} onChange={(e) => handleChange("y", Number(e.target.value))} className="w-full h-10 px-3 mt-1 text-white border bg-white/5 border-white/10 rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Фотографии (Drag & Drop)</label>
                </div>
                
                {/* Dropzone */}
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    isDragActive ? 'border-orange-500 bg-orange-500/10' : 'border-white/20 hover:bg-white/5 hover:border-white/40'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragActive ? 'text-orange-500' : 'text-slate-500'}`} />
                  <p className="text-sm font-medium text-slate-300">
                    {isDragActive ? "Отпустите файлы здесь..." : "Перетащите фото сюда или кликните для выбора"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG до 2MB</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {formData.images?.map((img, i) => (
                    <div key={i} className="relative overflow-hidden border aspect-square rounded-xl border-white/10 group">
                      <img src={img} alt="" className="object-cover w-full h-full" />
                      <button 
                        onClick={() => removeImage(i)}
                        className="absolute flex items-center justify-center w-8 h-8 transition-opacity bg-red-500 rounded-lg opacity-0 top-2 right-2 hover:bg-red-600 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  {(!formData.images || formData.images.length === 0) && (
                    <div className="flex flex-col items-center justify-center border border-dashed aspect-square rounded-xl border-white/20 text-slate-500">
                      <Plus className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-medium">Нет фото</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-between p-6 border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
              <span className="text-xs text-slate-500 font-medium">Все изменения сохраняются автоматически</span>
              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-6 py-3 font-bold text-black transition-all bg-white shadow-xl rounded-xl hover:bg-slate-200 shadow-white/10"
              >
                <Save className="w-5 h-5" /> Готово
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useOrbitaStore } from "@/lib/store";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Users, MapPin, Heart, Send, Share2, MessageCircle, Trash2, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { BookingWidget } from "@/components/booking-widget";
import { toast } from "sonner";
import { useState, useRef } from "react";

const TYPE_LABELS: Record<string, string> = {
  'YURT': 'Юрта', 'TAPCHAN': 'Тапчан', 'VIP': 'VIP',
  'FIELD': 'Поляна', 'GAZEBO': 'Беседка', 'BBQ': 'Мангал',
};

export default function LocationDetails() {
  const params = useParams();
  const id = params.id as string;
  const {
    locations, favorites, reviews: allReviews,
    toggleFavorite, addReview, deleteReview, isAdminLoggedIn, settings
  } = useOrbitaStore();

  const location = locations.find(l => l.id === id);
  const reviews = (allReviews || []).filter(r => r.locationId === id);

  const [activeImage, setActiveImage] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!location) {
    return (
      <div className="p-10 text-white flex flex-col items-center justify-center h-full gap-4 min-h-[60vh]">
        <div className="text-6xl">🏕️</div>
        <h2 className="text-2xl font-bold">Место не найдено</h2>
        <Link href="/" className="px-6 py-3 bg-orange-500 text-black rounded-xl font-semibold hover:bg-orange-400 transition-colors">К каталогу</Link>
      </div>
    );
  }

  const isFav = (favorites || []).includes(location.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(location.id);
    toast[isFav ? 'info' : 'success'](isFav ? "Удалено из избранного" : "Добавлено в избранное", { icon: isFav ? undefined : "❤️" });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Ссылка скопирована в буфер обмена!");
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `${settings?.whatsappMessage || ''}\n\n` +
      `📍 Место: ${location.name}\n` +
      `💰 Цена: ${settings?.currency}${location.pricePerHour.toLocaleString()}/ч\n` +
      `👥 Вместимость: до ${location.capacity} гостей\n\n` +
      `Пожалуйста, подскажите свободные даты.`
    );
    window.open(`https://wa.me/${settings?.whatsappNumber}?text=${message}`, '_blank');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (reviewPhotos.length + files.length > 5) {
      toast.error("Максимум 5 фотографий");
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setReviewPhotos(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim() || !reviewAuthor.trim()) {
      toast.error("Заполните имя и текст отзыва");
      return;
    }
    addReview({
      id: Math.random().toString(36).substr(2, 9),
      locationId: id,
      author: reviewAuthor,
      rating: reviewRating,
      text: reviewText,
      date: new Date().toISOString().split('T')[0],
      photos: reviewPhotos.length > 0 ? reviewPhotos : undefined,
    });
    setReviewText("");
    setReviewAuthor("");
    setReviewRating(5);
    setReviewPhotos([]);
    toast.success("Отзыв опубликован! Спасибо.");
  };

  const handleDeleteReview = (reviewId: string) => {
    deleteReview(reviewId);
    toast.success("Отзыв удалён");
  };

  const nextImage = () => setActiveImage((prev) => (prev + 1) % location.images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + location.images.length) % location.images.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 lg:p-14 w-full max-w-7xl mx-auto"
    >
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10">
        <ChevronLeft className="w-4 h-4" />
        Назад
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Галерея */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-[320px] md:h-[400px] lg:h-[500px] rounded-[2rem] overflow-hidden relative mb-3 group border border-white/5"
          >
            <img
              key={activeImage}
              src={location.images[activeImage]}
              className="w-full h-full object-cover transition-opacity duration-500 animate-in fade-in"
              alt={location.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />

            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10 z-10">
              {activeImage + 1} / {location.images.length}
            </div>

            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button onClick={handleShare} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Share2 className="w-4 h-4 text-white" />
              </button>
              <button onClick={handleFavorite} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
            </div>

            {location.images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-4 z-10">
              <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-orange-400 border border-orange-500/20">
                {TYPE_LABELS[location.type] || location.type}
              </span>
            </div>
          </motion.div>

          {/* Миниатюры */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar">
            {location.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-orange-500' : 'border-white/10 opacity-50 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="thumb" />
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 break-words">{location.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-white">{location.rating.toFixed(1)}</span>
                  <span className="text-slate-500">({reviews.length} отзывов)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>до {location.capacity} гостей</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-sm">{settings?.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="glass-card p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-emerald-500/10 bg-emerald-500/5">
            <div>
              <p className="text-white font-bold mb-1">Задать вопрос</p>
              <p className="text-slate-400 text-sm">Свяжитесь с нами напрямую для уточнения деталей.</p>
            </div>
            <button
              onClick={handleWhatsApp}
              className="shrink-0 flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          </div>

          {/* Описание */}
          <div className="glass-card p-6 mb-6 border-white/5">
            <h3 className="text-lg font-bold text-white mb-3">Описание места</h3>
            <p className="text-slate-400 leading-relaxed">{location.description}</p>
          </div>

          {/* Отзывы */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              Отзывы <span className="text-slate-500 text-base font-medium">({reviews.length})</span>
            </h3>

            {reviews.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-400 mb-6 border-white/5">
                <div className="text-3xl mb-3 text-slate-600">⭐</div>
                <p className="font-medium">Станьте первым, кто оставит отзыв об этом месте!</p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-5 border-white/5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-bold border border-white/10 shrink-0">
                          {review.author?.[0] || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-white">{review.author}</div>
                          <div className="text-xs text-slate-500">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                          ))}
                        </div>
                        {isAdminLoggedIn && (
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="ml-2 w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all border border-red-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed mb-3">{review.text}</p>
                    {review.photos && review.photos.length > 0 && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {review.photos.map((photo, pi) => (
                          <button
                            key={pi}
                            onClick={() => setLightboxPhoto(photo)}
                            className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                          >
                            <img src={photo} alt={`Фото ${pi + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Форма отзыва */}
            <div className="glass-panel p-6 border-white/5">
              <h4 className="text-xl font-bold text-white mb-5">Ваш отзыв</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ваше имя</label>
                  <input
                    type="text"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="Александр"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-white outline-none focus:border-orange-500/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Оценка</label>
                  <div className="flex gap-2 items-center h-12">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewRating(star)}
                        className="transition-transform hover:scale-125"
                      >
                        <Star className={`w-7 h-7 transition-colors ${star <= (hoverRating || reviewRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Комментарий</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Расскажите о ваших впечатлениях..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-500 outline-none focus:border-orange-500/50 transition-all resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5 mb-5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Фотографии (до 5 шт.)</label>
                <div className="flex gap-2 flex-wrap">
                  {reviewPhotos.map((photo, pi) => (
                    <div key={pi} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setReviewPhotos(prev => prev.filter((_, i) => i !== pi))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {reviewPhotos.length < 5 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500 hover:border-white/40 hover:text-slate-400 transition-all"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={!reviewText.trim() || !reviewAuthor.trim()}
                className={`w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all ${reviewText.trim() && reviewAuthor.trim()
                  ? 'bg-white text-black hover:bg-slate-200 shadow-xl shadow-white/5'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                  }`}
              >
                <Send className="w-4 h-4" /> Опубликовать отзыв
              </button>
            </div>
          </div>
        </div>

        {/* Виджет бронирования */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <BookingWidget
              locationId={location.id}
              pricePerHour={location.pricePerHour}
              locationName={location.name}
            />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <X className="w-5 h-5" />
          </button>
          <img src={lightboxPhoto} alt="" className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </motion.div>
  );
}

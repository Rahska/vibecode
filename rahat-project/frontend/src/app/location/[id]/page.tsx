"use client";

import { useRahatStore } from "@/lib/store";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Users, MapPin, Heart, Send, Share2, MessageCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { BookingWidget } from "@/components/booking-widget";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { PageSkeleton } from "@/components/page-skeleton";

const WHATSAPP_NUMBER = "77001234567"; // Замените на ваш номер

const TYPE_LABELS: Record<string, string> = {
  'YURT': 'Юрта', 'TAPCHAN': 'Тапчан', 'VIP': 'VIP',
  'FIELD': 'Поляна', 'GAZEBO': 'Беседка', 'BBQ': 'Мангал',
};

export default function LocationDetails() {
  const params = useParams();
  const id = params.id as string;
  const {
    locations, favorites, reviews: allReviews, profile,
    toggleFavorite, addReview, deleteReview, addRecentlyViewed, isAdminMode
  } = useRahatStore();

  const location = locations.find(l => l.id === id);
  const reviews = allReviews.filter(r => r.locationId === id);

  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (id && !isLoading) {
      addRecentlyViewed(id);
    }
  }, [id, isLoading, addRecentlyViewed]);

  if (isLoading) return <PageSkeleton />;

  if (!location) {
    return (
      <div className="p-10 text-white flex flex-col items-center justify-center h-full gap-4">
        <div className="text-6xl">🏕️</div>
        <h2 className="text-2xl font-bold">Место не найдено</h2>
        <Link href="/" className="px-6 py-3 bg-cyan-500 text-black rounded-xl font-semibold">К каталогу</Link>
      </div>
    );
  }

  const isFav = favorites.includes(location.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(location.id);
    if (!isFav) {
      toast.success("Добавлено в избранное", { icon: "❤️" });
    } else {
      toast.info("Удалено из избранного");
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(window.location.href);
    toast.success("Ссылка скопирована в буфер обмена!");
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Здравствуйте! Хочу узнать о месте "${location.name}".\n\n` +
      `Цена: ₸${location.pricePerHour.toLocaleString()}/ч\n` +
      `Вместимость: до ${location.capacity} гостей\n\n` +
      `Пожалуйста, подскажите свободные даты.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) {
      toast.error("Напишите текст отзыва");
      return;
    }
    addReview({
      id: Math.random().toString(36).substr(2, 9),
      locationId: id,
      author: profile.name,
      rating: reviewRating,
      text: reviewText,
      date: new Date().toISOString().split('T')[0]
    });
    setReviewText("");
    setReviewRating(5);
    toast.success("Отзыв опубликован! Спасибо.");
  };

  const handleDeleteReview = (reviewId: string) => {
    deleteReview(reviewId);
    toast.success("Отзыв удалён");
  };

  const nextImage = () => setActiveImage((prev) => (prev + 1) % location.images.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + location.images.length) % location.images.length);

  const recommended = locations
    .filter(l => l.id !== id && l.type === location.type)
    .slice(0, 3);

  if (recommended.length < 3) {
    const others = locations.filter(l => l.id !== id && !recommended.find(r => r.id === l.id));
    recommended.push(...others.slice(0, 3 - recommended.length));
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 lg:p-14 w-full max-w-7xl mx-auto"
    >
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10">
        <ChevronLeft className="w-4 h-4" />
        Назад
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* Галерея */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-[400px] lg:h-[500px] rounded-[2rem] overflow-hidden relative mb-4 group"
          >
            <img
              key={activeImage}
              src={location.images[activeImage] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000'}
              className="w-full h-full object-cover transition-opacity duration-500 animate-in fade-in"
              alt={`${location.name} — фото ${activeImage + 1}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />

            <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10 z-10">
              {activeImage + 1} / {location.images.length || 1}
            </div>

            <div className="absolute top-6 right-6 flex gap-2 z-10">
              <button
                onClick={handleShare}
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Поделиться"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleFavorite}
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
            </div>

            {location.images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            <div className="absolute bottom-6 left-6 z-10">
              <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-cyan-400 border border-cyan-500/20">
                {TYPE_LABELS[location.type] || location.type}
              </span>
            </div>
          </motion.div>

          {/* Миниатюры */}
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {location.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-cyan-500' : 'border-white/10 opacity-50 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="thumb" loading="lazy" />
              </button>
            ))}
          </div>

          {/* Название и мета-инфо */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{location.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-white">{location.rating.toFixed(1)}</span>
                  <span className="text-slate-500">({reviews.length} отзывов)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>До {location.capacity} гостей</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>Алматы, Казахстан</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="glass-card p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-green-500/20 bg-green-500/5">
            <div>
              <p className="text-white font-semibold mb-1">Есть вопросы?</p>
              <p className="text-slate-400 text-sm">Напишите администратору в WhatsApp — ответим в течение 5 минут.</p>
            </div>
            <button
              onClick={handleWhatsApp}
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)]"
            >
              <MessageCircle className="w-5 h-5" />
              Написать в WhatsApp
            </button>
          </div>

          {/* Описание */}
          <div className="glass-card p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Об этом месте</h3>
            <p className="text-slate-400 leading-relaxed text-base">
              {location.description || `Насладитесь первоклассным отдыхом в ${location.name}. Идеально для корпоративных мероприятий, семейных торжеств и романтических встреч в окружении природы Казахстана.`}
            </p>
          </div>

          {/* Удобства */}
          {location.features.length > 0 && (
            <div className="glass-card p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Удобства</h3>
              <div className="flex flex-wrap gap-3">
                {location.features.map((feature, i) => (
                  <div key={i} className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-slate-300 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Отзывы */}
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-white mb-6">
              Отзывы <span className="text-slate-500 text-lg font-normal">({reviews.length})</span>
            </h3>

            {reviews.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-400 mb-6">
                <div className="text-4xl mb-2">⭐</div>
                <p>Пока нет отзывов. Оставьте первый!</p>
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold text-sm">
                          {review.author[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{review.author}</div>
                          <div className="text-xs text-slate-500">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                          ))}
                        </div>
                        {isAdminMode && (
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="ml-2 w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                            title="Удалить отзыв"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{review.text}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Форма отзыва */}
            <div className="glass-panel p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Оставить отзыв</h4>

              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setReviewRating(star)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star className={`w-8 h-8 transition-colors ${star <= (hoverRating || reviewRating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Поделитесь впечатлениями от этого места..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 transition-colors resize-none mb-4"
              />

              <button
                onClick={handleSubmitReview}
                disabled={!reviewText.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  reviewText.trim()
                    ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                Отправить отзыв
              </button>
            </div>
          </div>

          {/* Похожие места */}
          {recommended.length > 0 && (
            <div className="mt-16 mb-8 border-t border-white/10 pt-10">
              <h3 className="text-2xl font-semibold text-white mb-6">Вам может понравиться</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommended.map(rec => (
                  <Link href={`/location/${rec.id}`} key={rec.id} className="block group">
                    <div className="glass-card p-2 border-white/5 hover:border-white/20">
                      <div className="w-full h-32 rounded-xl overflow-hidden mb-3 relative">
                        <img src={rec.images[0]} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] font-semibold text-white">{rec.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="px-1 pb-1">
                        <p className="text-white font-semibold text-sm truncate">{rec.name}</p>
                        <p className="text-slate-400 text-xs">₸{rec.pricePerHour.toLocaleString()}/ч</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Виджет бронирования */}
        <div>
          <div className="sticky top-14">
            <BookingWidget locationId={location.id} pricePerHour={location.pricePerHour} locationName={location.name} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

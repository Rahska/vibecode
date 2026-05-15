"use client";

import { useOrbitaStore } from "@/lib/store";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Users, MapPin, Heart, Send, Share2, MessageCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { BookingWidget } from "@/components/booking-widget";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { PageSkeleton } from "@/components/page-skeleton";

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
  const reviews = allReviews.filter(r => r.locationId === id);

  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <PageSkeleton />;

  if (!location) {
    return (
      <div className="p-10 text-white flex flex-col items-center justify-center h-full gap-4">
        <div className="text-6xl">🏕️</div>
        <h2 className="text-2xl font-bold">Место не найдено</h2>
        <Link href="/" className="px-6 py-3 bg-orange-500 text-black rounded-xl font-semibold">К каталогу</Link>
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
      `${settings.whatsappMessage}\n\n` +
      `📍 Место: ${location.name}\n` +
      `💰 Цена: ${settings.currency}${location.pricePerHour.toLocaleString()}/ч\n` +
      `👥 Вместимость: до ${location.capacity} гостей\n\n` +
      `Пожалуйста, подскажите свободные даты.`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
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
      date: new Date().toISOString().split('T')[0]
    });
    setReviewText("");
    setReviewAuthor("");
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
            className="w-full h-[400px] lg:h-[500px] rounded-[2.5rem] overflow-hidden relative mb-4 group border border-white/5"
          >
            <img
              key={activeImage}
              src={location.images[activeImage]}
              className="w-full h-full object-cover transition-opacity duration-500 animate-in fade-in"
              alt={location.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />

            <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10 z-10">
              {activeImage + 1} / {location.images.length}
            </div>

            <div className="absolute top-6 right-6 flex gap-2 z-10">
              <button
                onClick={handleShare}
                className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
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
              <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-orange-400 border border-orange-500/20">
                {TYPE_LABELS[location.type] || location.type}
              </span>
            </div>
          </motion.div>

          {/* Миниатюры */}
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2 hide-scrollbar">
            {location.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-orange-500' : 'border-white/10 opacity-50 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="thumb" />
              </button>
            ))}
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">{location.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-white">{location.rating.toFixed(1)}</span>
                  <span className="text-slate-500">({reviews.length} отзывов)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-500" />
                  <span className="font-medium text-slate-300">до {location.capacity} гостей</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-500" />
                  <span className="font-medium text-slate-300">{settings.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="glass-card p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-emerald-500/10 bg-emerald-500/5">
            <div>
              <p className="text-white font-bold mb-1">Задать вопрос</p>
              <p className="text-slate-400 text-sm">Свяжитесь с нами напрямую для уточнения деталей.</p>
            </div>
            <button
              onClick={handleWhatsApp}
              className="flex-shrink-0 flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Консультация
            </button>
          </div>

          <div className="glass-card p-8 mb-8 border-white/5">
            <h3 className="text-xl font-bold text-white mb-4">Описание места</h3>
            <p className="text-slate-400 leading-relaxed text-lg">
              {location.description}
            </p>
          </div>

          {/* Отзывы */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              Отзывы <span className="text-slate-500 text-lg font-medium">({reviews.length})</span>
            </h3>

            {reviews.length === 0 ? (
              <div className="glass-card p-10 text-center text-slate-400 mb-8 border-white/5">
                <div className="text-4xl mb-4 text-slate-600">⭐</div>
                <p className="font-medium">Станьте первым, кто оставит отзыв об этом месте!</p>
              </div>
            ) : (
              <div className="space-y-4 mb-10">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 border-white/5"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white font-bold text-lg border border-white/10">
                          {review.author[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">{review.author}</div>
                          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                          ))}
                        </div>
                        {isAdminLoggedIn && (
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="ml-4 w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all border border-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-lg">{review.text}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Форма отзыва */}
            <div className="glass-panel p-8 border-white/5">
              <h4 className="text-2xl font-bold text-white mb-6">Ваш отзыв</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ваше имя</label>
                  <input 
                    type="text" 
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="Александр"
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white outline-none focus:border-orange-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Оценка</label>
                  <div className="flex gap-2 items-center h-14">
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
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Комментарий</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Расскажите о ваших впечатлениях..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-500 outline-none focus:border-orange-500/50 transition-all resize-none"
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={!reviewText.trim() || !reviewAuthor.trim()}
                className={`w-full h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                  reviewText.trim() && reviewAuthor.trim()
                    ? 'bg-white text-black hover:bg-slate-200 shadow-xl shadow-white/5'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <Send className="w-5 h-5" /> Опубликовать отзыв
              </button>
            </div>
          </div>
        </div>

        {/* Виджет бронирования */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <BookingWidget 
              locationId={location.id} 
              pricePerHour={location.pricePerHour} 
              locationName={location.name} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

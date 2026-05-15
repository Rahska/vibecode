"use client";

import { useRahatStore } from "@/lib/store";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Star, Users, MapPin, Heart, Send } from "lucide-react";
import Link from "next/link";
import { BookingWidget } from "@/components/booking-widget";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { PageSkeleton } from "@/components/page-skeleton";

export default function LocationDetails() {
  const params = useParams();
  const id = params.id as string;
  const location = useRahatStore(state => state.locations.find(l => l.id === id));
  const favorites = useRahatStore(state => state.favorites);
  const reviews = useRahatStore(state => state.reviews.filter(r => r.locationId === id));
  const profile = useRahatStore(state => state.profile);
  const toggleFavorite = useRahatStore(state => state.toggleFavorite);
  const addReview = useRahatStore(state => state.addReview);
  const addRecentlyViewed = useRahatStore(state => state.addRecentlyViewed);

  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Track recently viewed
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
        <h2 className="text-2xl font-bold">Location not found</h2>
        <Link href="/" className="px-6 py-3 bg-cyan-500 text-black rounded-xl font-semibold">Back to Explore</Link>
      </div>
    );
  }

  const isFav = favorites.includes(location.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(location.id);
    if (!isFav) {
      toast.success("Added to favorites", { icon: "❤️" });
    } else {
      toast.info("Removed from favorites");
    }
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) {
      toast.error("Please write a review first");
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
    toast.success("Review submitted! Thank you.");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 lg:p-14 w-full max-w-7xl mx-auto"
    >
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10">
        <ChevronLeft className="w-4 h-4" />
        Back to Explore
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* Gallery Slider */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-[400px] lg:h-[500px] rounded-[2rem] overflow-hidden relative mb-4 group"
          >
            <img 
              src={location.images[activeImage] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000'} 
              className="w-full h-full object-cover transition-all duration-500"
              alt={location.name}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
            
            <button 
              onClick={handleFavorite}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors z-10"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>

            <div className="absolute bottom-6 left-6 z-10">
              <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-cyan-400 border border-cyan-500/20">
                {location.type}
              </span>
            </div>
          </motion.div>

          <div className="flex gap-3 mb-10 overflow-x-auto pb-2" style={{scrollbarWidth:'none'}}>
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

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{location.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-white">{location.rating.toFixed(1)}</span>
                  <span className="text-slate-500">({reviews.length} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Up to {location.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>Almaty, Kazakhstan</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">About This Place</h3>
            <p className="text-slate-400 leading-relaxed text-base">
              Experience ultimate luxury in our premium {location.name}. Perfect for corporate events, 
              family gatherings, or romantic getaways. Enjoy breathtaking views of the Almaty mountains, 
              high-end service, and absolute privacy. Every detail is carefully designed to provide 
              an unforgettable premium stay in the heart of Kazakhstan&apos;s nature.
            </p>
          </div>

          <div className="glass-card p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Premium Features</h3>
            <div className="flex flex-wrap gap-3">
              {location.features.map((feature, i) => (
                <div key={i} className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-slate-300 text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-white mb-6">
              Reviews <span className="text-slate-500 text-lg font-normal">({reviews.length})</span>
            </h3>

            {reviews.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-400 mb-6">
                <div className="text-4xl mb-2">⭐</div>
                <p>No reviews yet. Be the first to leave one!</p>
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
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{review.text}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Write Review Form */}
            <div className="glass-panel p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Write a Review</h4>
              
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
                placeholder="Share your experience at this location..."
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
                Submit Review
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-14">
            <BookingWidget locationId={location.id} pricePerHour={location.pricePerHour} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LocationType = 'YURT' | 'TAPCHAN' | 'VIP' | 'FIELD' | 'GAZEBO' | 'BBQ';

export interface Location {
  id: string;
  name: string;
  description: string;
  type: LocationType;
  pricePerHour: number;
  capacity: number;
  rating: number;
  images: string[];
  features: string[];
  isActive: boolean;
  glowColor?: string;
}

export interface Booking {
  id: string;
  locationId: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 0-23
  endHour: number; // 0-23
  totalPrice: number;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: number;
}

export interface Review {
  id: string;
  locationId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Activity {
  id: string;
  message: string;
  time: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  bio: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}

interface RahatState {
  locations: Location[];
  bookings: Booking[];
  favorites: string[];
  reviews: Review[];
  activities: Activity[];
  profile: UserProfile;
  notifications: Notification[];
  recentlyViewed: string[];
  
  // Location Actions
  addLocation: (location: Location) => void;
  updateLocation: (id: string, location: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  uploadPhoto: (locationId: string, base64: string) => void;
  deletePhoto: (locationId: string, photoIndex: number) => void;
  
  // Booking Actions
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  cancelBooking: (bookingId: string) => void;
  
  // User Actions
  toggleFavorite: (locationId: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addRecentlyViewed: (locationId: string) => void;
  
  // Interactions
  addReview: (review: Review) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addActivity: (message: string) => void;
}

const INITIAL_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Royal Yurt V1',
    description: 'Experience ultimate luxury in our premium Royal Yurt V1. Perfect for corporate events, family gatherings, or romantic getaways. Enjoy breathtaking views of the Almaty mountains, high-end service, and absolute privacy. Every detail is carefully designed to provide an unforgettable premium stay in the heart of Kazakhstan\'s nature.',
    type: 'YURT',
    pricePerHour: 50,
    capacity: 10,
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1000&auto=format&fit=crop'],
    features: ['Wi-Fi', 'Heating', 'Smart TV'],
    isActive: true,
    glowColor: 'glow-cyan'
  },
  {
    id: '2',
    name: 'Sky Lounge Tapchan',
    description: 'Elevate your relaxation at the Sky Lounge Tapchan. Offering panoramic views and premium services including a dedicated waiter and high-end hookah. Ideal for special celebrations and VIP gatherings.',
    type: 'VIP',
    pricePerHour: 85,
    capacity: 15,
    rating: 5.0,
    images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000&auto=format&fit=crop'],
    features: ['Panorama', 'Waiters', 'Premium Hookah'],
    isActive: true,
    glowColor: 'glow-blue'
  },
  {
    id: '3',
    name: 'Forest Gazebo',
    description: 'Immerse yourself in nature with our Forest Gazebo. Features a built-in BBQ grill and stunning forest views. A perfect escape for family picnics and outdoor enthusiasts.',
    type: 'GAZEBO',
    pricePerHour: 30,
    capacity: 8,
    rating: 4.7,
    images: ['https://images.unsplash.com/photo-1499803270242-467f73115827?q=80&w=1000&auto=format&fit=crop'],
    features: ['BBQ Grill', 'Nature View'],
    isActive: true,
    glowColor: 'glow-cyan'
  },
  {
    id: '4',
    name: 'Grand Family Yurt',
    description: 'A spacious traditional yurt designed for large families and groups. Authentic Kazakh interior mixed with modern amenities for a comfortable stay.',
    type: 'YURT',
    pricePerHour: 65,
    capacity: 20,
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1526402923594-555e142e0b57?q=80&w=1000&auto=format&fit=crop'],
    features: ['Large Capacity', 'Traditional Decor', 'Air Conditioning'],
    isActive: true,
    glowColor: 'glow-cyan'
  },
  {
    id: '5',
    name: 'Riverside BBQ Spot',
    description: 'Enjoy a perfect BBQ day right next to the mountain river. Fully equipped with grills, prep areas, and comfortable seating for your group.',
    type: 'BBQ',
    pricePerHour: 25,
    capacity: 12,
    rating: 4.6,
    images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop'],
    features: ['River View', 'Professional Grill', 'Prep Area'],
    isActive: true,
    glowColor: 'glow-blue'
  },
  {
    id: '6',
    name: 'Sunset VIP Field',
    description: 'An exclusive open-air field setup perfect for sunset watching, outdoor yoga, or premium private events with spectacular valley views.',
    type: 'FIELD',
    pricePerHour: 100,
    capacity: 50,
    rating: 5.0,
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop'],
    features: ['Open Space', 'Sunset View', 'Event Ready'],
    isActive: true,
    glowColor: 'glow-cyan'
  }
];

export const useRahatStore = create<RahatState>()(
  persist(
    (set, get) => ({
      locations: INITIAL_LOCATIONS,
      bookings: [],
      favorites: [],
      reviews: [
        { id: 'r1', locationId: '1', author: 'Alex M.', rating: 5, text: 'Amazing yurt experience! The views are breathtaking.', date: '2026-05-10' },
        { id: 'r2', locationId: '1', author: 'Sarah K.', rating: 4.8, text: 'Very cozy and warm, perfect for weekend getaway.', date: '2026-05-12' },
        { id: 'r3', locationId: '2', author: 'Mike T.', rating: 5, text: 'Premium service, the hookah was top notch.', date: '2026-05-14' }
      ],
      activities: [
        { id: 'a1', message: 'Alex booked Royal Yurt V1', time: '2 mins ago' },
        { id: 'a2', message: 'Sarah left a 5-star review', time: '1 hour ago' },
        { id: 'a3', message: 'New location added: VIP Gazebo', time: '3 hours ago' }
      ],
      profile: {
        name: 'Guest User',
        email: 'guest@example.com',
        phone: '+1 234 567 890',
        avatar: '',
        memberSince: '2026',
        bio: 'I love exploring premium locations and enjoying nature.'
      },
      notifications: [
        { id: 'n1', title: 'Welcome to RAHAT!', message: 'Explore our premium locations and book your first stay.', isRead: false, createdAt: Date.now() }
      ],
      recentlyViewed: [],

      addLocation: (location) => {
        set((state) => ({ locations: [...state.locations, location] }));
        get().addActivity(`New location added: ${location.name}`);
      },
      
      updateLocation: (id, updated) => set((state) => ({
        locations: state.locations.map(loc => loc.id === id ? { ...loc, ...updated } : loc)
      })),
      
      deleteLocation: (id) => set((state) => ({
        locations: state.locations.filter(loc => loc.id !== id),
        favorites: state.favorites.filter(favId => favId !== id),
        recentlyViewed: state.recentlyViewed.filter(viewId => viewId !== id)
      })),

      uploadPhoto: (locationId, base64) => set((state) => ({
        locations: state.locations.map(loc => 
          loc.id === locationId ? { ...loc, images: [...loc.images, base64] } : loc
        )
      })),

      deletePhoto: (locationId, photoIndex) => set((state) => ({
        locations: state.locations.map(loc => 
          loc.id === locationId ? { ...loc, images: loc.images.filter((_, idx) => idx !== photoIndex) } : loc
        )
      })),

      addBooking: (booking) => {
        set((state) => ({ bookings: [...state.bookings, booking] }));
        get().addActivity(`New booking created for location ID: ${booking.locationId}`);
        get().addNotification({ title: 'Booking Confirmed', message: `Your booking for $${booking.totalPrice} has been confirmed.` });
      },
      
      updateBooking: (id, updated) => set((state) => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, ...updated } : b)
      })),

      cancelBooking: (bookingId) => {
        set((state) => ({
          bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)
        }));
        get().addNotification({ title: 'Booking Cancelled', message: `Booking #${bookingId.substring(0,6)} has been cancelled.` });
      },

      toggleFavorite: (locationId) => set((state) => {
        const isFav = state.favorites.includes(locationId);
        return {
          favorites: isFav 
            ? state.favorites.filter(id => id !== locationId)
            : [...state.favorites, locationId]
        };
      }),

      updateProfile: (profile) => set((state) => ({
        profile: { ...state.profile, ...profile }
      })),

      addRecentlyViewed: (locationId) => set((state) => {
        const filtered = state.recentlyViewed.filter(id => id !== locationId);
        return { recentlyViewed: [locationId, ...filtered].slice(0, 10) }; // Keep last 10
      }),

      addReview: (review) => {
        const { reviews, updateLocation, addActivity } = get();
        const newReviews = [...reviews, review];
        set({ reviews: newReviews });
        
        // Recalculate rating
        const locReviews = newReviews.filter(r => r.locationId === review.locationId);
        const avgRating = locReviews.reduce((acc, curr) => acc + curr.rating, 0) / locReviews.length;
        
        updateLocation(review.locationId, { rating: Number(avgRating.toFixed(1)) });
        addActivity(`${review.author} left a ${review.rating}-star review`);
      },

      addNotification: (notif) => set((state) => ({
        notifications: [{ ...notif, id: Math.random().toString(36).substr(2, 9), isRead: false, createdAt: Date.now() }, ...state.notifications]
      })),

      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),

      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      })),

      addActivity: (message) => set((state) => ({
        activities: [{ id: Math.random().toString(36).substr(2, 9), message, time: 'Just now' }, ...state.activities].slice(0, 20)
      }))
    }),
    {
      name: 'rahat-storage',
    }
  )
);

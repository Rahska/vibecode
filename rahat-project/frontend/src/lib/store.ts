import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  x?: number;
  y?: number;
}

export interface Booking {
  id: string;
  locationId: string;
  date: string; // YYYY-MM-DD
  startHour: number;
  endHour: number;
  totalPrice: number;
  deposit?: string;
  paymentStatus?: 'UNPAID' | 'DEPOSIT_PAID' | 'FULLY_PAID';
  notes?: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'COMPLETED';
  createdAt: number;
  customerName: string;
  customerPhone: string;
}

export interface Review {
  id: string;
  locationId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  photos?: string[];
}

export interface Activity {
  id: string;
  message: string;
  time: string;
}

export interface AppSettings {
  whatsappNumber: string;
  whatsappMessage: string;
  platformName: string;
  address: string;
  workingHours: string;
  currency: string;
  adminPin: string;
}

interface OrbitaState {
  locations: Location[];
  bookings: Booking[];
  favorites: string[];
  reviews: Review[];
  activities: Activity[];
  isAdminLoggedIn: boolean;
  settings: AppSettings;
  _hasHydrated: boolean;

  // Hydration
  setHasHydrated: (state: boolean) => void;

  // Admin Actions
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Location CRUD
  addLocation: (location: Location) => void;
  updateLocation: (id: string, location: Partial<Location>) => void;
  deleteLocation: (id: string) => void;

  // Booking Management
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;

  // Review Management
  addReview: (review: Review) => void;
  deleteReview: (id: string) => void;

  // Interaction
  toggleFavorite: (locationId: string) => void;
  addActivity: (message: string) => void;

  // Setters for external sync
  setLocations: (locations: Location[]) => void;
  setBookings: (bookings: Booking[]) => void;
  setFavorites: (favorites: string[]) => void;
  setReviews: (reviews: Review[]) => void;
  setSettings: (settings: AppSettings) => void;
}

const INITIAL_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Королевская юрта V1',
    description: 'Ощутите подлинную роскошь в нашей премиальной Королевской юрте. Идеально подходит для корпоративных мероприятий и семейных торжеств.',
    type: 'YURT',
    pricePerHour: 15000,
    capacity: 10,
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1600'],
    features: ['Wi-Fi', 'Отопление', 'Smart TV'],
    isActive: true,
    glowColor: 'glow-cyan',
    x: 20, y: 30
  },
  {
    id: '2',
    name: 'Sky Lounge Тапчан',
    description: 'Панорамные виды и премиальный сервис. Идеально для особых торжеств.',
    type: 'VIP',
    pricePerHour: 25000,
    capacity: 15,
    rating: 5.0,
    images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1600'],
    features: ['Панорама', 'Официанты', 'Премиум кальян'],
    isActive: true,
    glowColor: 'glow-blue',
    x: 70, y: 40
  },
  {
    id: '3',
    name: 'Лесная беседка',
    description: 'Погрузитесь в природу. Встроенный мангал и потрясающий лесной вид.',
    type: 'GAZEBO',
    pricePerHour: 8000,
    capacity: 8,
    rating: 4.7,
    images: ['https://images.unsplash.com/photo-1499803270242-467f73115827?q=80&w=1600'],
    features: ['Мангал', 'Вид на лес'],
    isActive: true,
    glowColor: 'glow-cyan',
    x: 45, y: 70
  }
];

export const useOrbitaStore = create<OrbitaState>()(
  persist(
    (set, get) => ({
      locations: INITIAL_LOCATIONS,
      bookings: [],
      favorites: [],
      reviews: [
        { id: 'r1', locationId: '1', author: 'Алексей', rating: 5, text: 'Отличное место! Приехали семьёй — все остались довольны.', date: '2026-05-10' }
      ],
      activities: [],
      isAdminLoggedIn: false,
      _hasHydrated: false,
      settings: {
        whatsappNumber: '77001234567',
        whatsappMessage: 'Здравствуйте! Хочу забронировать место в ОРБИТА.',
        platformName: 'ОРБИТА',
        address: 'г. Алматы, Горный гигант, 42',
        workingHours: '10:00 - 23:00',
        currency: '₸',
        adminPin: '7777'
      },

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      loginAdmin: (pin) => {
        if (pin === get().settings.adminPin) {
          set({ isAdminLoggedIn: true });
          return true;
        }
        return false;
      },

      logoutAdmin: () => set({ isAdminLoggedIn: false }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      addLocation: (loc) => set((state) => ({ locations: [...state.locations, loc] })),

      updateLocation: (id, updated) => set((state) => ({
        locations: state.locations.map(l => l.id === id ? { ...l, ...updated } : l)
      })),

      deleteLocation: (id) => set((state) => ({
        locations: state.locations.filter(l => l.id !== id)
      })),

      addBooking: async (booking) => {
        set((state) => ({ bookings: [booking, ...state.bookings] }));
        try {
          const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location_id: booking.locationId,
              date: booking.date,
              start_hour: booking.startHour,
              end_hour: booking.endHour,
              total_price: booking.totalPrice,
              customer_name: booking.customerName,
              customer_phone: booking.customerPhone,
              status: booking.status,
              notes: booking.notes,
            }),
          });
          if (!res.ok) throw new Error('Failed to sync booking');
        } catch (err) {
          console.error(err);
          // Optional: rollback if needed
        }
      },

      updateBooking: (id, updated) => set((state) => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, ...updated } : b)
      })),

      cancelBooking: async (id) => {
        set((state) => ({
          bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b)
        }));
        try {
          await fetch(`/api/bookings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CANCELLED' }),
          });
        } catch (err) { console.error(err); }
      },

      addReview: async (review) => {
        set((state) => {
          const newReviews = [...state.reviews, review];
          const locReviews = newReviews.filter(r => r.locationId === review.locationId);
          const avg = locReviews.reduce((a, b) => a + b.rating, 0) / locReviews.length;
          return {
            reviews: newReviews,
            locations: state.locations.map(l => l.id === review.locationId ? { ...l, rating: Number(avg.toFixed(1)) } : l)
          };
        });

        try {
          await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location_id: review.locationId,
              author: review.author,
              rating: review.rating,
              text: review.text,
              photos: review.photos,
            }),
          });
        } catch (err) { console.error(err); }
      },

      deleteReview: async (id) => {
        set((state) => ({
          reviews: state.reviews.filter(r => r.id !== id)
        }));
        try {
          await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
        } catch (err) { console.error(err); }
      },

      toggleFavorite: async (id) => {
        const isFavorite = get().favorites.includes(id);
        set((state) => ({
          favorites: isFavorite
            ? state.favorites.filter(f => f !== id)
            : [...state.favorites, id]
        }));

        try {
          if (isFavorite) {
            await fetch(`/api/favorites/${id}`, { method: 'DELETE' });
          } else {
            await fetch('/api/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ locationId: id }),
            });
          }
        } catch (err) { console.error(err); }
      },

      addActivity: (message) => set((state) => ({
        activities: [{ id: Math.random().toString(36).substr(2, 9), message, time: 'Только что' }, ...state.activities].slice(0, 50)
      })),

      setLocations: (locations) => set({ locations }),
      setBookings: (bookings) => set({ bookings }),
      setFavorites: (favorites) => set({ favorites }),
      setReviews: (reviews) => set({ reviews }),
      setSettings: (settings) => set({ settings })
    }),
    {
      name: 'orbita-storage-v2',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        locations: state.locations,
        bookings: state.bookings,
        favorites: state.favorites,
        reviews: state.reviews,
        activities: state.activities,
        isAdminLoggedIn: state.isAdminLoggedIn,
        settings: state.settings,
      }),
    }
  )
);

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
  isAdminMode: boolean;

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
  deleteReview: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addActivity: (message: string) => void;

  // Admin
  setAdminMode: (value: boolean) => void;
}

const INITIAL_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Королевская юрта V1',
    description: 'Ощутите подлинную роскошь в нашей премиальной Королевской юрте. Идеально подходит для корпоративных мероприятий, семейных торжеств или романтического отдыха. Наслаждайтесь захватывающими видами на горы Алматы, первоклассным сервисом и полной приватностью. Каждая деталь тщательно продумана для незабываемого отдыха в сердце природы Казахстана.',
    type: 'YURT',
    pricePerHour: 15000,
    capacity: 10,
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1000&auto=format&fit=crop'],
    features: ['Wi-Fi', 'Отопление', 'Smart TV'],
    isActive: true,
    glowColor: 'glow-cyan'
  },
  {
    id: '2',
    name: 'Sky Lounge Тапчан',
    description: 'Поднимите свой отдых на новый уровень в Sky Lounge Тапчан. Панорамные виды и премиальный сервис включают персонального официанта и элитный кальян. Идеально для особых торжеств и VIP-мероприятий.',
    type: 'VIP',
    pricePerHour: 25000,
    capacity: 15,
    rating: 5.0,
    images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000&auto=format&fit=crop'],
    features: ['Панорама', 'Официанты', 'Премиум кальян'],
    isActive: true,
    glowColor: 'glow-blue'
  },
  {
    id: '3',
    name: 'Лесная беседка',
    description: 'Погрузитесь в природу в нашей Лесной беседке. Встроенный мангал и потрясающий лесной вид. Отличный выбор для семейного пикника на природе.',
    type: 'GAZEBO',
    pricePerHour: 8000,
    capacity: 8,
    rating: 4.7,
    images: ['https://images.unsplash.com/photo-1499803270242-467f73115827?q=80&w=1000&auto=format&fit=crop'],
    features: ['Мангал', 'Вид на лес'],
    isActive: true,
    glowColor: 'glow-cyan'
  },
  {
    id: '4',
    name: 'Большая семейная юрта',
    description: 'Просторная традиционная юрта для больших семей и групп. Аутентичный казахский интерьер сочетается с современными удобствами для комфортного отдыха.',
    type: 'YURT',
    pricePerHour: 20000,
    capacity: 20,
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1526402923594-555e142e0b57?q=80&w=1000&auto=format&fit=crop'],
    features: ['Большая вместимость', 'Традиционный декор', 'Кондиционер'],
    isActive: true,
    glowColor: 'glow-cyan'
  },
  {
    id: '5',
    name: 'Мангал у реки',
    description: 'Проведите идеальный день с мангалом у горной реки. Полностью оборудованная зона с грилем, площадкой для готовки и удобными местами для всей компании.',
    type: 'BBQ',
    pricePerHour: 6000,
    capacity: 12,
    rating: 4.6,
    images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop'],
    features: ['Вид на реку', 'Профессиональный гриль', 'Зона готовки'],
    isActive: true,
    glowColor: 'glow-blue'
  },
  {
    id: '6',
    name: 'VIP Поляна «Закат»',
    description: 'Эксклюзивная открытая поляна для наблюдения за закатом, йоги на воздухе или частных мероприятий с захватывающим видом на долину.',
    type: 'FIELD',
    pricePerHour: 30000,
    capacity: 50,
    rating: 5.0,
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop'],
    features: ['Открытое пространство', 'Вид на закат', 'Готово для мероприятий'],
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
        { id: 'r1', locationId: '1', author: 'Алексей М.', rating: 5, text: 'Потрясающий опыт в юрте! Виды просто захватывают дух.', date: '2026-05-10' },
        { id: 'r2', locationId: '1', author: 'Сара К.', rating: 4.8, text: 'Очень уютно и тепло — идеальный вариант для уикенда.', date: '2026-05-12' },
        { id: 'r3', locationId: '2', author: 'Михаил Т.', rating: 5, text: 'Премиальный сервис, кальян был отменным!', date: '2026-05-14' }
      ],
      activities: [
        { id: 'a1', message: 'Алексей забронировал Королевскую юрту V1', time: '2 мин. назад' },
        { id: 'a2', message: 'Сара оставила отзыв на 5 звёзд', time: '1 час назад' },
        { id: 'a3', message: 'Добавлено новое место: VIP Беседка', time: '3 часа назад' }
      ],
      profile: {
        name: 'Гость',
        email: 'guest@rakhat.kz',
        phone: '+7 700 000 0000',
        avatar: '',
        memberSince: '2026',
        bio: 'Люблю исследовать премиальные места и наслаждаться природой.'
      },
      notifications: [
        { id: 'n1', title: 'Добро пожаловать в RAHAT!', message: 'Исследуйте наши премиальные места и сделайте первое бронирование.', isRead: false, createdAt: Date.now() }
      ],
      recentlyViewed: [],
      isAdminMode: false,

      addLocation: (location) => {
        set((state) => ({ locations: [...state.locations, location] }));
        get().addActivity(`Добавлено новое место: ${location.name}`);
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
        get().addActivity(`Новая бронь создана для места ID: ${booking.locationId}`);
        get().addNotification({ title: 'Бронь подтверждена', message: `Ваша бронь на сумму ₸${booking.totalPrice.toLocaleString()} подтверждена.` });
      },

      updateBooking: (id, updated) => set((state) => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, ...updated } : b)
      })),

      cancelBooking: (bookingId) => {
        set((state) => ({
          bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)
        }));
        get().addNotification({ title: 'Бронь отменена', message: `Бронь #${bookingId.substring(0, 6).toUpperCase()} была отменена.` });
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
        return { recentlyViewed: [locationId, ...filtered].slice(0, 10) };
      }),

      addReview: (review) => {
        const { reviews, updateLocation, addActivity } = get();
        const newReviews = [...reviews, review];
        set({ reviews: newReviews });

        // Пересчёт рейтинга
        const locReviews = newReviews.filter(r => r.locationId === review.locationId);
        const avgRating = locReviews.reduce((acc, curr) => acc + curr.rating, 0) / locReviews.length;

        updateLocation(review.locationId, { rating: Number(avgRating.toFixed(1)) });
        addActivity(`${review.author} оставил(а) отзыв на ${review.rating} звёзд`);
      },

      deleteReview: (id) => set((state) => ({
        reviews: state.reviews.filter(r => r.id !== id)
      })),

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
        activities: [{ id: Math.random().toString(36).substr(2, 9), message, time: 'Только что' }, ...state.activities].slice(0, 20)
      })),

      setAdminMode: (value) => set({ isAdminMode: value }),
    }),
    {
      name: 'rahat-storage',
    }
  )
);

"use client";

import { useEffect } from "react";
import { useOrbitaStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { createClient } from "@/lib/supabase/client";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { initialize: initAuth, user } = useAuthStore();
  const { 
    setLocations, 
    setSettings, 
    setBookings, 
    setReviews, 
    setFavorites,
    setHasHydrated
  } = useOrbitaStore();

  useEffect(() => {
    // 1. Initialize Auth
    initAuth();

    // 2. Fetch Initial Public Data
    const fetchPublicData = async () => {
      const supabase = createClient();
      
      const [locationsRes, settingsRes, reviewsRes] = await Promise.all([
        supabase.from('locations').select('*').order('created_at'),
        supabase.from('settings').select('*').single(),
        supabase.from('reviews').select('*').order('created_at', { ascending: false })
      ]);

      if (locationsRes.data) setLocations(locationsRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
      if (reviewsRes.data) setReviews(reviewsRes.data);
      
      setHasHydrated(true);
    };

    fetchPublicData();
  }, [initAuth, setLocations, setSettings, setReviews, setHasHydrated]);

  useEffect(() => {
    // 3. Fetch User Specific Data when logged in
    if (user) {
      const fetchUserData = async () => {
        const supabase = createClient();
        
        const [bookingsRes, favoritesRes] = await Promise.all([
          supabase.from('bookings').select('*').eq('user_id', user.id).order('date', { ascending: false }),
          supabase.from('favorites').select('location_id').eq('user_id', user.id)
        ]);

        if (bookingsRes.data) setBookings(bookingsRes.data);
        if (favoritesRes.data) setFavorites(favoritesRes.data.map(f => f.location_id));
      };

      fetchUserData();

      // 4. Set up Real-time for user bookings
      const supabase = createClient();
      const channel = supabase
        .channel('user_bookings')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Real-time booking change:', payload);
            // Refresh data or handle granular update
            fetchUserData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Clear user data on logout
      setBookings([]);
      setFavorites([]);
    }
  }, [user, setBookings, setFavorites]);

  return <>{children}</>;
}

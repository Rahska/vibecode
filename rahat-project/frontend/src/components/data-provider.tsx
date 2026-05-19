"use client";

import { useEffect } from "react";
import { useOrbitaStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { 
    setLocations, 
    setSettings, 
    setBookings, 
    setReviews, 
    setFavorites,
    setHasHydrated,
    guestId,
    _hasHydrated
  } = useOrbitaStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    // 1. Initialize Guest ID if missing
    if (!guestId) {
      const newId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      useOrbitaStore.setState({ guestId: newId });
    }

    // 2. Fetch Initial Public Data
    const fetchPublicData = async () => {
      const supabase = createClient();
      
      const [locationsRes, settingsRes, reviewsRes] = await Promise.all([
        supabase.from('locations').select('*').order('created_at'),
        supabase.from('settings').select('*').single(),
        supabase.from('reviews').select('*').order('created_at', { ascending: false })
      ]);

      if (locationsRes.data) {
        const mapped = locationsRes.data.map((loc: any) => ({
          ...loc,
          pricePerHour: loc.price_per_hour,
          isActive: loc.is_active,
          glowColor: loc.glow_color,
        }));
        setLocations(mapped);
      }

      if (settingsRes.data) {
        const s = settingsRes.data;
        setSettings({
          whatsappNumber: s.whatsapp_number || "",
          whatsappMessage: s.whatsapp_message || "",
          platformName: s.platform_name || "",
          address: s.address || "",
          workingHours: s.working_hours || "",
          currency: s.currency || "₸",
          adminPin: s.admin_pin || "",
        });
      }

      if (reviewsRes.data) {
        const mapped = reviewsRes.data.map((r: any) => ({
          ...r,
          locationId: r.location_id,
          date: new Date(r.created_at).toLocaleDateString(),
        }));
        setReviews(mapped);
      }
    };

    fetchPublicData();
  }, [_hasHydrated, guestId, setLocations, setSettings, setReviews]);

  useEffect(() => {
    if (!_hasHydrated || !guestId) return;

    // 3. Fetch Guest Specific Data
    const fetchGuestData = async () => {
      const supabase = createClient();
      
      const [bookingsRes, favoritesRes] = await Promise.all([
        supabase.from('bookings').select('*').eq('guest_id', guestId).order('date', { ascending: false }),
        supabase.from('favorites').select('location_id').eq('guest_id', guestId)
      ]);

      if (bookingsRes.data) {
        const mapped = bookingsRes.data.map((b: any) => ({
          ...b,
          locationId: b.location_id,
          startHour: b.start_hour,
          endHour: b.end_hour,
          totalPrice: b.total_price,
          paymentStatus: b.payment_status,
          customerName: b.customer_name,
          customerPhone: b.customer_phone,
          createdAt: new Date(b.created_at).getTime(),
        }));
        setBookings(mapped);
      }
      if (favoritesRes.data) setFavorites(favoritesRes.data.map((f: any) => f.location_id));
    };

    fetchGuestData();

    // 4. Set up Real-time for guest bookings
    const supabase = createClient();
    const channel = supabase
      .channel(`guest_bookings_${guestId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `guest_id=eq.${guestId}` },
        () => {
          fetchGuestData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [_hasHydrated, guestId, setBookings, setFavorites]);

  return <>{children}</>;
}

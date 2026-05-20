"use client";

import { useEffect } from "react";
import { useOrbitaStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { locationFromDb } from "@/lib/location-mapper";

function mapBookingRow(b: Record<string, unknown>) {
  return {
    id: String(b.id),
    locationId: String(b.location_id),
    date: String(b.date),
    startHour: Number(b.start_hour),
    endHour: Number(b.end_hour),
    totalPrice: Number(b.total_price),
    deposit: b.deposit as string | undefined,
    paymentStatus: b.payment_status as 'UNPAID' | 'DEPOSIT_PAID' | 'FULLY_PAID' | undefined,
    notes: b.notes as string | undefined,
    status: b.status as 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'COMPLETED',
    customerName: String(b.customer_name ?? ''),
    customerPhone: String(b.customer_phone ?? ''),
    createdAt: b.created_at ? new Date(String(b.created_at)).getTime() : Date.now(),
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { 
    setLocations, 
    setSettings, 
    setBookings, 
    setReviews, 
    setFavorites,
    _hasHydrated,
    guestId,
  } = useOrbitaStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!guestId) {
      const newId = crypto.randomUUID?.() ?? (
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      );
      useOrbitaStore.setState({ guestId: newId });
    }
  }, [_hasHydrated, guestId]);

  useEffect(() => {
    if (!_hasHydrated) return;

    const fetchPublicData = async () => {
      const supabase = createClient();
      const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

      if (hasSupabase) {
        const [locationsRes, settingsRes, reviewsRes] = await Promise.all([
          supabase.from('locations').select('*').order('created_at'),
          supabase.from('settings').select('*').single(),
          supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        ]);

        if (locationsRes.data?.length) {
          setLocations(locationsRes.data.map((row: Record<string, unknown>) => locationFromDb(row)));
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
          setReviews(
            reviewsRes.data.map((r: Record<string, unknown>) => ({
              id: String(r.id),
              locationId: String(r.location_id),
              author: String(r.author),
              rating: Number(r.rating),
              text: String(r.text),
              date: r.created_at
                ? new Date(String(r.created_at)).toLocaleDateString('ru-RU')
                : new Date().toLocaleDateString('ru-RU'),
              photos: r.photos as string[] | undefined,
            }))
          );
        }
      } else {
        try {
          const res = await fetch('/api/locations');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) setLocations(data);
          }
        } catch {
          /* offline demo uses zustand seed data */
        }
      }
    };

    fetchPublicData();
  }, [_hasHydrated, setLocations, setSettings, setReviews]);

  useEffect(() => {
    if (!_hasHydrated || !guestId) return;

    const fetchGuestData = async () => {
      try {
        const [bookingsRes, favoritesRes] = await Promise.all([
          fetch(`/api/bookings?guestId=${encodeURIComponent(guestId)}`),
          fetch(`/api/favorites?guestId=${encodeURIComponent(guestId)}`),
        ]);

        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          if (Array.isArray(data)) setBookings(data.map(mapBookingRow));
        }

        if (favoritesRes.ok) {
          const ids = await favoritesRes.json();
          if (Array.isArray(ids)) setFavorites(ids.map(String));
        }
      } catch (err) {
        console.error('Failed to load guest data:', err);
      }
    };

    fetchGuestData();

    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

    const channel = supabase
      .channel(`guest_bookings_${guestId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `guest_id=eq.${guestId}` },
        () => fetchGuestData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [_hasHydrated, guestId, setBookings, setFavorites]);

  return <>{children}</>;
}

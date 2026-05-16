import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const guestId = searchParams.get('guestId');
  
  if (!guestId) return NextResponse.json([]);

  const { data, error } = await supabase.from('favorites').select('location_id').eq('guest_id', guestId);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(f => f.location_id));
}

export async function POST(request: Request) {
  const supabase = await createAdminClient();
  const body = await request.json();
  const { guestId, locationId } = body;

  if (!guestId) return NextResponse.json({ error: "Guest ID required" }, { status: 400 });

  const { data, error } = await supabase.from('favorites').insert({
    guest_id: guestId,
    location_id: locationId
  }).select().single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

import { cookies } from "next/headers";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const guestId = searchParams.get('guestId');
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('orbita_admin_session')?.value === 'true';

  if (!guestId && !isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let query = supabase.from('bookings').select('*, locations(*)');
  
  if (!isAdmin) {
    query = query.eq('guest_id', guestId);
  }
  
  const { data, error } = await query.order('date', { ascending: false });
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createAdminClient(); // Use admin client to allow guest insert
  const body = await request.json();
  const { guestId, ...bookingData } = body;

  if (!guestId) return NextResponse.json({ error: "Guest ID required" }, { status: 400 });

  const { data, error } = await supabase.from('bookings').insert({
    ...bookingData,
    guest_id: guestId
  }).select().single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

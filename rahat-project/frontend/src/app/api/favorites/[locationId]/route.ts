import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;
  const { searchParams } = new URL(request.url);
  const guestId = searchParams.get('guestId');
  const supabase = await createAdminClient();
  
  if (!guestId) return NextResponse.json({ error: "Guest ID required" }, { status: 400 });

  const { error } = await supabase.from('favorites').delete().eq('guest_id', guestId).eq('location_id', locationId);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

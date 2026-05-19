import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/api-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, locations(*)')
    .order('date', { ascending: false });
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

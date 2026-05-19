import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/api-auth";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('settings').select('*').single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase.from('settings').update(body).eq('id', 1).select().single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();
  const body = await request.json();
  
  const updateData: any = {};
  if (body.status !== undefined) updateData.status = body.status;
  if (body.paymentStatus !== undefined) updateData.payment_status = body.paymentStatus;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.deposit !== undefined) updateData.deposit = body.deposit;

  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

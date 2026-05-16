import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const guestId = formData.get('guestId') as string || 'anonymous';
    
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const adminSupabase = await createAdminClient();
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filePath = `uploads/${guestId}/${fileName}`;

    const { data, error } = await adminSupabase.storage
      .from('orbita-images')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: { publicUrl } } = adminSupabase.storage
      .from('orbita-images')
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

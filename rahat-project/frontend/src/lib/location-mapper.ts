import type { Location } from "@/lib/store";

/** Maps app Location fields to Supabase column names */
export function locationToDbPayload(loc: Partial<Location>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (loc.name !== undefined) payload.name = loc.name;
  if (loc.description !== undefined) payload.description = loc.description;
  if (loc.type !== undefined) payload.type = loc.type;
  if (loc.pricePerHour !== undefined) payload.price_per_hour = loc.pricePerHour;
  if (loc.capacity !== undefined) payload.capacity = loc.capacity;
  if (loc.rating !== undefined) payload.rating = loc.rating;
  if (loc.images !== undefined) payload.images = loc.images;
  if (loc.features !== undefined) payload.features = loc.features;
  if (loc.isActive !== undefined) payload.is_active = loc.isActive;
  if (loc.glowColor !== undefined) payload.glow_color = loc.glowColor;
  if (loc.x !== undefined) payload.x = loc.x;
  if (loc.y !== undefined) payload.y = loc.y;
  return payload;
}

/** Maps a Supabase locations row to app Location */
export function locationFromDb(row: Record<string, unknown>): Location {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    type: row.type as Location["type"],
    pricePerHour: Number(row.price_per_hour ?? 0),
    capacity: Number(row.capacity ?? 0),
    rating: Number(row.rating ?? 5),
    images: (row.images as string[]) ?? [],
    features: (row.features as string[]) ?? [],
    isActive: row.is_active !== false,
    glowColor: row.glow_color as string | undefined,
    x: row.x != null ? Number(row.x) : undefined,
    y: row.y != null ? Number(row.y) : undefined,
  };
}

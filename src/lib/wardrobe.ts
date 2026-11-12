import "server-only";
import { requireUser } from "./auth";
import { createClient } from "./supabase/server";
import { PHOTO_BUCKET, type WardrobeItem } from "./wardrobe-options";

export type WardrobeResult =
  | { ok: true; items: WardrobeItem[] }
  | { ok: false; reason: "not-set-up" | "error" };

// Loads the logged-in user's clothes, newest first, with temporary photo links.
export async function getWardrobeItems(): Promise<WardrobeResult> {
  await requireUser();
  const supabase = await createClient();
  if (!supabase) return { ok: false, reason: "error" };

  // Row Level Security already limits this to the current user's rows.
  const { data, error } = await supabase
    .from("wardrobe_items")
    .select("id, name, category, colour, season, image_path")
    .order("created_at", { ascending: false });

  if (error) {
    // 42P01 / PGRST205: the table doesn't exist yet (SQL setup not run).
    const notSetUp = error.code === "42P01" || error.code === "PGRST205";
    if (!notSetUp) console.error("Loading wardrobe failed:", error.message);
    return { ok: false, reason: notSetUp ? "not-set-up" : "error" };
  }
  if (!data.length) return { ok: true, items: [] };

  // Photos are private, so we create links that work for one hour.
  const { data: signed } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(data.map((row) => row.image_path), 60 * 60);
  const urlByPath = new Map(signed?.map((s) => [s.path, s.signedUrl]) ?? []);

  return {
    ok: true,
    items: data.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      colour: row.colour,
      season: row.season,
      imageUrl: urlByPath.get(row.image_path) ?? null,
    })),
  };
}

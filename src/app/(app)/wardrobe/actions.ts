"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { aiConfigured, detectClothes, type DetectedPiece } from "@/lib/ai/detect-clothes";
import { isCategory, isSeason, PHOTO_BUCKET, type Category, type Season } from "@/lib/wardrobe-options";

export type PieceDraft = { name: string; category: Category; colour: string; season: Season };

export type AnalyzeResult =
  | { ok: true; pieces: PieceDraft[] }
  | { ok: false; reason: "no-key" | "failed" | "nothing-found" };

const isOwnPath = (userId: string, path: string) => path.startsWith(`${userId}/`) && !path.includes("..");

// Asks Claude which clothes are in the uploaded photo.
export async function analyzePhoto(imagePath: string): Promise<AnalyzeResult> {
  const user = await requireUser();
  const supabase = await createClient();
  if (!supabase || !isOwnPath(user.id, imagePath)) return { ok: false, reason: "failed" };
  if (!aiConfigured()) return { ok: false, reason: "no-key" };

  const { data: file, error } = await supabase.storage.from(PHOTO_BUCKET).download(imagePath);
  if (error || !file) {
    console.error("Couldn't read photo for analysis:", error?.message);
    return { ok: false, reason: "failed" };
  }
  const type = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  const result = await detectClothes(new Uint8Array(await file.arrayBuffer()), type);
  if (!result.ok) return result;
  if (result.pieces.length === 0) return { ok: false, reason: "nothing-found" };

  return {
    ok: true,
    pieces: result.pieces.map((p: DetectedPiece) => ({
      name: p.name.slice(0, 80),
      category: isCategory(p.category) ? p.category : "top",
      colour: p.colour.slice(0, 30),
      season: isSeason(p.season) ? p.season : "all",
    })),
  };
}

// Saves one or more pieces that all come from the same photo.
export async function saveItems(imagePath: string, pieces: PieceDraft[]): Promise<{ error: string }> {
  const user = await requireUser();
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase isn't connected." };
  if (!isOwnPath(user.id, imagePath)) return { error: "Please add a photo first." };
  if (!Array.isArray(pieces) || pieces.length === 0 || pieces.length > 8) {
    return { error: "Pick at least one piece to add." };
  }

  const rows = [];
  for (const p of pieces) {
    const name = String(p?.name ?? "").trim();
    const colour = String(p?.colour ?? "").trim();
    if (!name || name.length > 80) return { error: "Every piece needs a name (up to 80 characters)." };
    if (!isCategory(p.category) || !isSeason(p.season) || colour.length > 30) {
      return { error: "Something looks off with the details. Please check and try again." };
    }
    rows.push({ user_id: user.id, name, category: p.category, colour: colour || null, season: p.season, image_path: imagePath });
  }

  const { error } = await supabase.from("wardrobe_items").insert(rows);
  if (error) {
    console.error("Adding items failed:", error.message);
    return { error: "We couldn't save your pieces. Please try again." };
  }
  redirect("/wardrobe");
}

// Removes an uploaded photo the user decided not to keep (only if nothing uses it).
export async function discardPhoto(imagePath: string) {
  const user = await requireUser();
  const supabase = await createClient();
  if (!supabase || !isOwnPath(user.id, imagePath)) return;
  await removePhotoIfUnused(supabase, imagePath);
}

export async function deleteItem(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  // RLS means this only ever finds and deletes the current user's own item.
  const { data: item } = await supabase
    .from("wardrobe_items")
    .delete()
    .eq("id", id)
    .select("image_path")
    .maybeSingle();

  if (item?.image_path) await removePhotoIfUnused(supabase, item.image_path);
  refresh();
}

// Several pieces can share one photo, so only delete the file when the last one goes.
async function removePhotoIfUnused(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  imagePath: string,
) {
  const { count } = await supabase
    .from("wardrobe_items")
    .select("id", { count: "exact", head: true })
    .eq("image_path", imagePath);
  if (count === 0) await supabase.storage.from(PHOTO_BUCKET).remove([imagePath]);
}

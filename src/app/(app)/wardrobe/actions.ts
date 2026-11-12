"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isCategory, isSeason, PHOTO_BUCKET } from "@/lib/wardrobe-options";

export type AddItemState = { error?: string };

export async function addItem(_prev: AddItemState, formData: FormData): Promise<AddItemState> {
  const user = await requireUser();
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase isn't connected." };

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const colour = String(formData.get("colour") ?? "").trim() || null;
  const season = String(formData.get("season") ?? "all");
  const imagePath = String(formData.get("imagePath") ?? "");

  // The photo must sit in this user's own folder (uploaded by the form just before).
  const ownPhoto = imagePath.startsWith(`${user.id}/`) && !imagePath.includes("..");
  const removePhoto = () => (ownPhoto ? supabase.storage.from(PHOTO_BUCKET).remove([imagePath]) : null);

  if (!ownPhoto) return { error: "Please add a photo of your item." };
  if (!name || name.length > 80) {
    await removePhoto();
    return { error: "Give your item a name (up to 80 characters)." };
  }
  if (!isCategory(category) || !isSeason(season) || (colour && colour.length > 30)) {
    await removePhoto();
    return { error: "Something looks off with the details. Please check and try again." };
  }

  const { error } = await supabase
    .from("wardrobe_items")
    .insert({ user_id: user.id, name, category, colour, season, image_path: imagePath });

  if (error) {
    console.error("Adding item failed:", error.message);
    await removePhoto();
    return { error: "We couldn't save that item. Please try again." };
  }

  redirect("/wardrobe");
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

  if (item?.image_path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([item.image_path]);
  }
  refresh();
}

"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, MAX_PHOTO_BYTES, PHOTO_BUCKET, SEASONS } from "@/lib/wardrobe-options";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import { addItem, type AddItemState } from "../actions";
import { shrinkPhoto } from "./shrinkPhoto";

const field =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-fg placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

// Uploads the photo from the browser, then asks the server to save the item.
async function submit(prev: AddItemState, formData: FormData): Promise<AddItemState> {
  const file = formData.get("photo");
  formData.delete("photo"); // the photo goes to Storage, not through the server
  if (!(file instanceof File) || file.size === 0) return { error: "Please add a photo of your item." };

  const supabase = createClient();
  if (!supabase) return { error: "Supabase isn't connected." };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Your session ended. Please log in again." };

  const photo = (await shrinkPhoto(file)) ?? file;
  if (photo.size > MAX_PHOTO_BYTES) return { error: "That photo is too big. Please pick one under 5 MB." };
  if (photo === file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { error: "We couldn't read that photo. Please choose a JPG or PNG." };
  }

  const ext = photo === file ? (file.type.split("/")[1] ?? "jpg") : "jpg";
  const path = `${auth.user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, photo, { contentType: photo.type || "image/jpeg" });
  if (error) {
    console.error("Photo upload failed:", error.message);
    return { error: "We couldn't upload your photo. Please try again." };
  }

  formData.set("imagePath", path);
  return addItem(prev, formData);
}

export function AddItemForm() {
  const [state, formAction, pending] = useActionState(submit, {});
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <form action={formAction} className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-10">
      <label className="group relative block aspect-[4/3] cursor-pointer md:aspect-[4/5] overflow-hidden rounded-3xl border-2 border-dashed border-line bg-surface transition hover:border-accent focus-within:border-accent">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview of your item" className="size-full object-cover" />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-soft text-3xl" aria-hidden>📸</span>
            <span className="font-display text-xl font-semibold">Add a photo</span>
            <span className="text-sm text-muted">Snap it or pick from your gallery</span>
          </span>
        )}
        {preview && (
          <span className="absolute bottom-3 right-3 rounded-full bg-bg/90 px-3 py-1.5 text-xs font-medium shadow">
            Change photo
          </span>
        )}
        <input
          name="photo"
          type="file"
          accept="image/*"
          required
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
        />
      </label>

      <div className="space-y-5">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Name</span>
          <input name="name" required maxLength={80} placeholder="e.g. Cream linen shirt" className={field} />
        </label>

        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-medium">Category</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.map((c, i) => (
              <label key={c.value} className="cursor-pointer">
                <input type="radio" name="category" value={c.value} defaultChecked={i === 0} className="peer sr-only" />
                <span className="flex h-12 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm transition peer-checked:border-accent peer-checked:bg-soft peer-checked:font-medium peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40">
                  <span aria-hidden>{c.emoji}</span>
                  {c.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">
              Colour <span className="font-normal text-muted">(optional)</span>
            </span>
            <input name="colour" maxLength={30} placeholder="e.g. Terracotta" className={field} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Season</span>
            <select name="season" defaultValue="all" className={field}>
              {SEASONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        {state.error && (
          <p role="alert" className="rounded-xl bg-soft px-4 py-3 text-sm">{state.error}</p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
          <Link href="/wardrobe" className={buttonSecondary}>Cancel</Link>
          <button type="submit" disabled={pending} className={`${buttonPrimary} sm:flex-1`}>
            {pending ? "Saving your piece…" : "Add to my wardrobe"}
          </button>
        </div>
      </div>
    </form>
  );
}

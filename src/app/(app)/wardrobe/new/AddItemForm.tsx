"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, MAX_PHOTO_BYTES, PHOTO_BUCKET, SEASONS } from "@/lib/wardrobe-options";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import { analyzePhoto, discardPhoto, saveItems, type PieceDraft } from "../actions";
import { shrinkPhoto } from "./shrinkPhoto";

const field =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-fg placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

type Draft = PieceDraft & { key: string; include: boolean };
type Stage = "pick" | "uploading" | "analyzing" | "review";

const blankPiece = (): Draft => ({ key: crypto.randomUUID(), include: true, name: "", category: "top", colour: "", season: "all" });

const NOTICES = {
  "no-key": "AI isn't switched on yet, so fill in the details yourself.",
  failed: "Our AI couldn't read that photo just now, so fill in the details yourself.",
  "nothing-found": "We couldn't spot any clothes in that photo. Add the details yourself, or try a clearer photo.",
} as const;

// Uploads the (shrunk) photo straight from the browser to the user's private folder.
async function uploadPhoto(file: File): Promise<{ path: string } | { error: string }> {
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
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, photo, { contentType: photo.type || "image/jpeg" });
  if (error) {
    console.error("Photo upload failed:", error.message);
    return { error: "We couldn't upload your photo. Please try again." };
  }
  return { path };
}

export function AddItemForm() {
  const [stage, setStage] = useState<Stage>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [pieces, setPieces] = useState<Draft[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function findPieces() {
    if (!file) return;
    setError(null);
    setStage("uploading");
    const uploaded = await uploadPhoto(file);
    if ("error" in uploaded) {
      setError(uploaded.error);
      setStage("pick");
      return;
    }
    setImagePath(uploaded.path);
    setStage("analyzing");
    const result = await analyzePhoto(uploaded.path);
    if (result.ok) {
      setPieces(result.pieces.map((p) => ({ ...p, key: crypto.randomUUID(), include: true })));
      setNotice(null);
    } else {
      setPieces([blankPiece()]);
      setNotice(NOTICES[result.reason]);
    }
    setStage("review");
  }

  function startOver() {
    if (imagePath) void discardPhoto(imagePath);
    setImagePath(null);
    setPieces([]);
    setNotice(null);
    setError(null);
    setStage("pick");
  }

  const update = (key: string, patch: Partial<Draft>) =>
    setPieces((ps) => ps.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  const chosen = pieces.filter((p) => p.include);

  function save() {
    if (!imagePath) return;
    setError(null);
    startSaving(async () => {
      const result = await saveItems(
        imagePath,
        chosen.map(({ name, category, colour, season }) => ({ name, category, colour, season })),
      );
      if (result?.error) setError(result.error);
    });
  }

  const busy = stage === "uploading" || stage === "analyzing";

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] md:gap-10">
      {/* Photo */}
      <div>
        <label
          className={`group relative block aspect-[4/3] overflow-hidden rounded-3xl border-2 border-dashed border-line bg-surface transition md:aspect-[4/5] ${
            stage === "pick" ? "cursor-pointer hover:border-accent focus-within:border-accent" : ""
          }`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Your photo" className="size-full object-cover" />
          ) : (
            <span className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-soft text-3xl" aria-hidden>📸</span>
              <span className="font-display text-xl font-semibold">Add a photo</span>
              <span className="text-sm text-muted">One piece or a whole outfit. We&apos;ll spot each item.</span>
            </span>
          )}
          {preview && stage === "pick" && (
            <span className="absolute bottom-3 right-3 rounded-full bg-bg/90 px-3 py-1.5 text-xs font-medium shadow">Change photo</span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-bg/70 backdrop-blur-sm" role="status">
              <span className="flex flex-col items-center gap-3 text-center">
                <span className="size-10 animate-spin rounded-full border-4 border-soft border-t-accent" aria-hidden />
                <span className="font-medium">{stage === "uploading" ? "Uploading your photo…" : "Spotting your pieces ✨"}</span>
              </span>
            </span>
          )}
          {stage === "pick" && (
            <input
              type="file"
              accept="image/*"
              aria-label="Choose a photo"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                setError(null);
                setPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
          )}
        </label>
      </div>

      {/* Steps */}
      <div className="space-y-5">
        {stage !== "review" ? (
          <>
            <ol className="space-y-3 text-sm text-muted">
              <li><span className="font-medium text-fg">1.</span> Add a photo of a piece, or of you wearing a full outfit.</li>
              <li><span className="font-medium text-fg">2.</span> Our AI spots each item and fills in the details.</li>
              <li><span className="font-medium text-fg">3.</span> Check them over, tweak anything, and save.</li>
            </ol>
            {error && <p role="alert" className="rounded-xl bg-soft px-4 py-3 text-sm">{error}</p>}
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Link href="/wardrobe" className={buttonSecondary}>Cancel</Link>
              <button type="button" onClick={findPieces} disabled={!file || busy} className={`${buttonPrimary} sm:flex-1`}>
                {busy ? "Working on it…" : "Find my pieces ✨"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="font-display text-2xl font-semibold">
                {notice ? "Add the details" : `We found ${pieces.length} ${pieces.length === 1 ? "piece" : "pieces"}`}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {notice ?? "Untick anything you don't want, and fix any details we got wrong."}
              </p>
            </div>

            <ul className="space-y-3">
              {pieces.map((p) => (
                <li key={p.key} className={`rounded-2xl border bg-surface p-4 transition ${p.include ? "border-line" : "border-line opacity-55"}`}>
                  <label className="mb-3 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={p.include}
                      onChange={(e) => update(p.key, { include: e.target.checked })}
                      className="size-5 accent-[var(--accent)]"
                    />
                    <span className="text-sm font-medium">
                      {CATEGORIES.find((c) => c.value === p.category)?.emoji} {p.include ? "Adding" : "Skipping"} this piece
                    </span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      aria-label="Name"
                      value={p.name}
                      maxLength={80}
                      placeholder="Name, e.g. Cream linen shirt"
                      onChange={(e) => update(p.key, { name: e.target.value })}
                      className={`${field} sm:col-span-2`}
                      disabled={!p.include}
                    />
                    <select
                      aria-label="Category"
                      value={p.category}
                      onChange={(e) => update(p.key, { category: e.target.value as Draft["category"] })}
                      className={field}
                      disabled={!p.include}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                      ))}
                    </select>
                    <select
                      aria-label="Season"
                      value={p.season}
                      onChange={(e) => update(p.key, { season: e.target.value as Draft["season"] })}
                      className={field}
                      disabled={!p.include}
                    >
                      {SEASONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <input
                      aria-label="Colour"
                      value={p.colour}
                      maxLength={30}
                      placeholder="Colour (optional)"
                      onChange={(e) => update(p.key, { colour: e.target.value })}
                      className={`${field} sm:col-span-2`}
                      disabled={!p.include}
                    />
                  </div>
                </li>
              ))}
            </ul>

            {pieces.length < 8 && (
              <button
                type="button"
                onClick={() => setPieces((ps) => [...ps, blankPiece()])}
                className="w-full rounded-2xl border-2 border-dashed border-line py-3 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
              >
                + Add another piece from this photo
              </button>
            )}

            {error && <p role="alert" className="rounded-xl bg-soft px-4 py-3 text-sm">{error}</p>}

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" onClick={startOver} disabled={saving} className={buttonSecondary}>Start over</button>
              <button
                type="button"
                onClick={save}
                disabled={saving || chosen.length === 0 || chosen.some((p) => !p.name.trim())}
                className={`${buttonPrimary} sm:flex-1`}
              >
                {saving
                  ? "Saving…"
                  : chosen.length === 0
                    ? "Pick at least one piece"
                    : `Add ${chosen.length} ${chosen.length === 1 ? "piece" : "pieces"} to my wardrobe`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

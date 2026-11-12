"use client";

import { useState } from "react";
import { CATEGORIES, SEASONS, type Category, type WardrobeItem } from "@/lib/wardrobe-options";
import { deleteItem } from "./actions";

const seasonLabel = (v: string) => SEASONS.find((s) => s.value === v)?.label ?? v;
const emojiFor = (v: string) => CATEGORIES.find((c) => c.value === v)?.emoji ?? "👕";

export function WardrobeGallery({ items }: { items: WardrobeItem[] }) {
  const [filter, setFilter] = useState<Category | "all">("all");
  const shown = filter === "all" ? items : items.filter((i) => i.category === filter);
  const counts = new Map<string, number>();
  items.forEach((i) => counts.set(i.category, (counts.get(i.category) ?? 0) + 1));

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
      active ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface hover:bg-soft"
    }`;

  return (
    <>
      <div className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1" role="toolbar" aria-label="Filter by category">
        <button type="button" onClick={() => setFilter("all")} aria-pressed={filter === "all"} className={chip(filter === "all")}>
          All · {items.length}
        </button>
        {CATEGORIES.filter((c) => counts.has(c.value)).map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setFilter(c.value)}
            aria-pressed={filter === c.value}
            className={chip(filter === c.value)}
          >
            {c.emoji} {c.label} · {counts.get(c.value)}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {shown.map((item) => (
          <li key={item.id} className="group overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="relative aspect-[4/5] bg-soft">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} loading="lazy" className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center text-4xl" aria-hidden>{emojiFor(item.category)}</span>
              )}
              <form
                action={deleteItem}
                onSubmit={(e) => {
                  if (!confirm(`Remove "${item.name}" from your wardrobe?`)) e.preventDefault();
                }}
                className="absolute right-2 top-2"
              >
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  aria-label={`Remove ${item.name}`}
                  className="grid size-9 place-items-center rounded-full bg-bg/90 text-fg shadow transition hover:bg-accent hover:text-accent-fg sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            </div>
            <div className="p-3">
              <p className="truncate font-medium" title={item.name}>{item.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted">
                {[item.colour, seasonLabel(item.season)].filter(Boolean).join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

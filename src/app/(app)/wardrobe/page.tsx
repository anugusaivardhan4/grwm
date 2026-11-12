import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/EmptyState";
import { buttonPrimary } from "@/components/ui";
import { getWardrobeItems } from "@/lib/wardrobe";
import { WardrobeGallery } from "./WardrobeGallery";

export const metadata: Metadata = { title: "My wardrobe — GRWM" };

export default function WardrobePage() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">My wardrobe</h1>
          <p className="mt-2 text-muted">Every piece you love, all in one place.</p>
        </div>
        <Link href="/wardrobe/new" className={`${buttonPrimary} gap-2`}>
          <span aria-hidden className="text-xl leading-none">+</span> Add item
        </Link>
      </div>
      <Suspense fallback={<GridSkeleton />}>
        <Wardrobe />
      </Suspense>
    </>
  );
}

async function Wardrobe() {
  const result = await getWardrobeItems();

  if (!result.ok) {
    return result.reason === "not-set-up" ? (
      <EmptyState
        emoji="🛠️"
        title="One quick setup step"
        text="Your wardrobe's storage isn't set up in Supabase yet. Run the SQL in supabase/migrations/001_wardrobe.sql (see the README), then refresh."
      />
    ) : (
      <EmptyState emoji="😕" title="Couldn't load your wardrobe" text="Something went wrong on our side. Please refresh and try again." />
    );
  }

  if (result.items.length === 0) {
    return (
      <EmptyState
        emoji="👚"
        title="Your closet is waiting"
        text="Add your first piece. Snap a photo, give it a name, and you're off!"
      />
    );
  }

  return <WardrobeGallery items={result.items} />;
}

function GridSkeleton() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4" aria-label="Loading your wardrobe">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-soft" />
      ))}
    </ul>
  );
}

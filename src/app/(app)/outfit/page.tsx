import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = { title: "Outfit — GRWM" };

export default function OutfitPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-bold">Outfit</h1>
      <p className="mb-8 mt-2 text-muted">Put together the look for your next moment.</p>
      <EmptyState
        emoji="💃"
        title="No outfits yet"
        text="Once your wardrobe is filled, this is where you'll style your perfect fit."
      />
    </>
  );
}

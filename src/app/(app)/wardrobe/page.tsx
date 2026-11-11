import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = { title: "My wardrobe — GRWM" };

export default function WardrobePage() {
  return (
    <>
      <h1 className="font-display text-4xl font-bold">My wardrobe</h1>
      <p className="mb-8 mt-2 text-muted">Every piece you love, all in one place.</p>
      <EmptyState
        emoji="👚"
        title="Your closet is waiting"
        text="Soon you'll be able to add your favourite pieces here. Stay tuned — it's going to be gorgeous."
      />
    </>
  );
}

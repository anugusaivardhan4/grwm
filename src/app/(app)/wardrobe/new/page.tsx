import type { Metadata } from "next";
import Link from "next/link";
import { AddItemForm } from "./AddItemForm";

export const metadata: Metadata = { title: "Add an item — GRWM" };

export default function NewItemPage() {
  return (
    <>
      <Link href="/wardrobe" className="text-sm font-medium text-muted hover:text-accent">
        ← Back to my wardrobe
      </Link>
      <h1 className="mt-3 font-display text-4xl font-bold">Add a piece</h1>
      <p className="mb-8 mt-2 text-muted">Snap a photo and our AI does the rest.</p>
      <AddItemForm />
    </>
  );
}

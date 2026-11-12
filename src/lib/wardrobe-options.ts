// The choices shown in the "Add item" form. Keep in sync with supabase/migrations/001_wardrobe.sql.
export const CATEGORIES = [
  { value: "top", label: "Tops", emoji: "👚" },
  { value: "bottom", label: "Bottoms", emoji: "👖" },
  { value: "dress", label: "Dresses", emoji: "👗" },
  { value: "outerwear", label: "Outerwear", emoji: "🧥" },
  { value: "shoes", label: "Shoes", emoji: "👟" },
  { value: "accessory", label: "Accessories", emoji: "👜" },
] as const;

export const SEASONS = [
  { value: "all", label: "All year" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];
export type Season = (typeof SEASONS)[number]["value"];

export const isCategory = (v: string): v is Category => CATEGORIES.some((c) => c.value === v);
export const isSeason = (v: string): v is Season => SEASONS.some((s) => s.value === v);

export const PHOTO_BUCKET = "wardrobe";
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export type WardrobeItem = {
  id: string;
  name: string;
  category: Category;
  colour: string | null;
  season: Season;
  imageUrl: string | null;
};

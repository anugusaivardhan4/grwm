"use client";

import { createBrowserClient } from "@supabase/ssr";

// Supabase client for the browser. Used to upload photos straight to Storage,
// so big phone photos never pass through our server.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

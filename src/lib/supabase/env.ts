// Reads your Supabase settings from .env.local. Returns null if they're missing,
// so the site can show a friendly message instead of crashing.
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export const MISSING_ENV_MESSAGE =
  "Supabase isn't connected yet. Add your keys to .env.local (see the README) and restart the dev server.";

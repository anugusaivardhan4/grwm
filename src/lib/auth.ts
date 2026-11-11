import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type CurrentUser = { id: string; email: string };

// The one place that answers "who is logged in?". Sends visitors to /login if nobody is.
export async function requireUser(): Promise<CurrentUser> {
  // Login checks always happen per request, never while pre-building the page.
  await connection();

  const supabase = await createClient();
  if (!supabase) redirect("/login");

  // getClaims() verifies the session token, so it can be trusted on the server.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/login");

  return { id: claims.sub, email: String(claims.email ?? "") };
}

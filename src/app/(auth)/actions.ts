"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MISSING_ENV_MESSAGE } from "@/lib/supabase/env";

export type AuthState = { error?: string; message?: string; email?: string };

function readForm(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function logIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readForm(formData);
  if (!email || !password) return { error: "Pop in your email and password.", email };

  const supabase = await createClient();
  if (!supabase) return { error: MISSING_ENV_MESSAGE, email };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const msg = /confirm/i.test(error.message)
      ? "Almost there! Check your inbox and confirm your email first."
      : "That email and password don't match. Give it another go?";
    return { error: msg, email };
  }

  redirect("/wardrobe");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readForm(formData);
  if (!email || !password) return { error: "Pop in your email and a password.", email };
  if (password.length < 8) return { error: "Make your password at least 8 characters.", email };

  const supabase = await createClient();
  if (!supabase) return { error: MISSING_ENV_MESSAGE, email };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl}/auth/confirm?next=/wardrobe` },
  });
  if (error) return { error: error.message, email };

  // If email confirmation is turned off in Supabase, the user is logged in straight away.
  if (data.session) redirect("/wardrobe");

  return {
    message: "You're nearly in! We've sent a confirmation link to your inbox — tap it to finish signing up.",
    email,
  };
}

export async function logOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}

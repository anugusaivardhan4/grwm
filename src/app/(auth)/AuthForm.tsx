"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "./actions";
import { buttonPrimary } from "@/components/ui";

type Props = {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
};

const inputClass =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-fg placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === "signup";

  if (state.message) {
    return (
      <div role="status" className="rounded-2xl bg-soft p-6 text-center">
        <p className="font-display text-xl font-semibold">Check your inbox ✨</p>
        <p className="mt-2 text-sm text-fg/80">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={state.email}
          className={inputClass}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={isSignup ? 8 : undefined}
          autoComplete={isSignup ? "new-password" : "current-password"}
          placeholder={isSignup ? "At least 8 characters" : "Your password"}
          className={inputClass}
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-xl bg-soft px-4 py-3 text-sm">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${buttonPrimary} w-full`}>
        {pending ? "One sec…" : isSignup ? "Create my account" : "Log in"}
      </button>

      <p className="text-center text-sm text-muted">
        {isSignup ? "Already have an account? " : "New to GRWM? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </form>
  );
}

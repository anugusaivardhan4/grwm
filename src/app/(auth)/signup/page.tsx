import type { Metadata } from "next";
import { AuthForm } from "../AuthForm";
import { signUp } from "../actions";

export const metadata: Metadata = { title: "Sign up — GRWM" };

export default function SignupPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Let&apos;s get you ready</h1>
      <p className="mb-7 mt-2 text-muted">Create your account and start building your dream closet.</p>
      <AuthForm mode="signup" action={signUp} />
    </>
  );
}

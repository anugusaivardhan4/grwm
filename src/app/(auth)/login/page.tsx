import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../AuthForm";
import { logIn } from "../actions";
import { ConfirmFailedNotice } from "./ConfirmFailedNotice";

export const metadata: Metadata = { title: "Log in — GRWM" };

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold">Welcome back</h1>
      <p className="mb-7 mt-2 text-muted">Your closet missed you. Let&apos;s get you ready.</p>
      <Suspense fallback={null}>
        <ConfirmFailedNotice />
      </Suspense>
      <AuthForm mode="login" action={logIn} />
    </>
  );
}

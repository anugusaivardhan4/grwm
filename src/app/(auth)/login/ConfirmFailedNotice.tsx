"use client";

import { useSearchParams } from "next/navigation";

export function ConfirmFailedNotice() {
  const failed = useSearchParams().get("confirm") === "failed";
  if (!failed) return null;
  return (
    <p role="alert" className="mb-5 rounded-xl bg-soft px-4 py-3 text-sm">
      That confirmation link didn&apos;t work (it may have expired). Try logging in, or sign up again for a fresh link.
    </p>
  );
}

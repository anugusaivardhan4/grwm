import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { requireUser } from "@/lib/auth";
import { logOut } from "../(auth)/actions";
import { NavLinks } from "./NavLinks";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <Logo href="/wardrobe" />
          <div className="flex items-center gap-2">
            <Suspense fallback={<span className="h-10 w-20" />}>
              <AccountMenu />
            </Suspense>
            <ThemeToggle />
          </div>
        </div>
        <NavLinks />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}

// Reads the session, so it streams in behind Suspense. Also guards every page in this group.
async function AccountMenu() {
  const user = await requireUser();
  return (
    <form action={logOut} className="flex items-center gap-3">
      <span className="hidden max-w-48 truncate text-sm text-muted sm:inline" title={user.email}>
        {user.email}
      </span>
      <button
        type="submit"
        className="h-10 rounded-full border border-line px-4 text-sm font-medium transition hover:bg-soft"
      >
        Log out
      </button>
    </form>
  );
}

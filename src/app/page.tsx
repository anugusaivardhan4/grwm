import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { buttonPrimary, buttonSecondary } from "@/components/ui";

const perks = [
  { emoji: "👗", title: "Your whole closet", text: "Every piece you own, in one place, always in your pocket." },
  { emoji: "✨", title: "Outfits in seconds", text: "Mix, match and save the looks that make you feel amazing." },
  { emoji: "💫", title: "Totally you", text: "Your vibe, your rules. We just help you show up as your best self." },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-5">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="hidden px-3 py-2 text-sm font-medium hover:text-accent sm:inline">
            Log in
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative mx-auto max-w-6xl overflow-hidden px-5 pb-16 pt-10 sm:pt-20">
          {/* Soft decorative blobs */}
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-10 size-72 rounded-full bg-blush opacity-60 blur-3xl dark:opacity-15 sm:size-96" />
          <div aria-hidden className="pointer-events-none absolute -left-20 top-60 size-56 rounded-full bg-gold opacity-25 blur-3xl dark:opacity-10" />

          <div className="relative max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-highlight/40 bg-surface/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-highlight">
              Get Ready With Me
            </p>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
              Your closet. Your style.{" "}
              <span className="italic text-accent">Your moment.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted sm:text-xl">
              Your wardrobe, your vibe, your perfect fit.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className={buttonPrimary}>
                Sign up — it&apos;s free
              </Link>
              <Link href="/login" className={buttonSecondary}>
                Log in
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <ul className="grid gap-4 sm:grid-cols-3">
            {perks.map((p) => (
              <li key={p.title} className="rounded-3xl border border-line bg-surface p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-soft text-2xl" aria-hidden>
                  {p.emoji}
                </span>
                <h2 className="mt-4 font-display text-xl font-semibold">{p.title}</h2>
                <p className="mt-1.5 text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-line px-5 py-6 text-center text-sm text-muted">
        Made with 💛 for every “what do I wear?” moment.
      </footer>
    </div>
  );
}

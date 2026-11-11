"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/wardrobe", label: "My wardrobe" },
  { href: "/outfit", label: "Outfit" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto flex w-full max-w-6xl gap-1 px-5" aria-label="Main">
      {links.map((l) => {
        const active = pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-3 text-sm font-medium transition ${
              active ? "border-accent text-accent" : "border-transparent text-muted hover:text-fg"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

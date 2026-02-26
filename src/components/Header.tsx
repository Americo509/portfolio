"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Container } from "@/components/Container";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projetos" },
  { href: "/about", label: "Sobre" },
  { href: "/contact", label: "Contato" }
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "backdrop-blur supports-[backdrop-filter]:bg-paper-1/65 dark:supports-[backdrop-filter]:bg-ink-1/55",
        scrolled ? "border-b border-borderSubtle" : "border-b border-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="focus-ring text-sm font-semibold tracking-tight"
          aria-label="Ir para Home"
        >
          Gustavo<span className="text-ink-4 dark:text-paper-1/60">.dev</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Navegação principal">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "focus-ring rounded-full px-3 py-2 text-sm transition",
                  active
                    ? "bg-accent-soft text-ink-1 dark:text-paper-1"
                    : "text-ink-4 dark:text-paper-1/70 hover:bg-paper-2/70 dark:hover:bg-ink-2/70"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            className="focus-ring hidden sm:inline-flex rounded-full px-3 py-2 text-sm text-ink-4 dark:text-paper-1/70 hover:bg-paper-2/70 dark:hover:bg-ink-2/70 transition"
            href="/projects"
          >
            Ver trabalhos
          </Link>
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}

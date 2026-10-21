"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/cn";

type NavCopy = { index: string; projects: string; about: string; contact: string; menu: string; close: string };

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function Header({ handle, copy }: { handle: string; copy: NavCopy }) {
  const pathname = usePathname();
  const nav = [
    { href: "/", label: copy.index },
    { href: "/projects", label: copy.projects },
    { href: "/about", label: copy.about },
    { href: "/contact", label: copy.contact }
  ];
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Véu para o conteúdo que rola por baixo não brigar com a navegação. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg from-40% to-transparent" />
      <div className="grid-editorial relative items-center pt-[calc(var(--hud-inset)+14px)]">
        <Link href="/" className="label col-span-6 text-fg md:col-span-3" aria-label="Ir para o início">
          <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-signal" />
          {handle}
        </Link>

        <nav className="col-span-6 hidden justify-center gap-8 md:flex" aria-label="Navegação principal">
          {nav.map((item, i) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("label group relative py-2 transition-colors", active ? "text-fg" : "text-muted hover:text-fg")}
              >
                <span className="mr-1.5 text-muted/70">0{i + 1}</span>
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-signal transition-transform duration-500 ease-cine",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="col-span-6 flex items-center justify-end gap-5 md:col-span-3">
          <ThemeToggle />
          <button
            type="button"
            className="label py-2 text-fg md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? copy.close : copy.menu}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 -z-10 flex flex-col justify-end bg-bg px-[var(--margin)] pb-16 transition-[clip-path] duration-700 ease-cine md:hidden",
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        )}
        aria-hidden={!open}
      >
        <nav aria-label="Navegação móvel" className="flex flex-col gap-2">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={open ? 0 : -1}
              className={cn(
                "font-display text-[clamp(3.5rem,17vw,7rem)]",
                isActive(pathname, item.href) ? "text-signal-ink" : "text-fg"
              )}
            >
              <span className="label mr-3 align-top text-muted">0{i + 1}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

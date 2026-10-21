"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ResenhaToggle } from "@/components/resenha/ResenhaToggle";
import { cn } from "@/lib/cn";
import { alternateHref, localeHref, type Locale } from "@/lib/i18n";
import type { Portfolio } from "@/types/portfolio.types";

type NavCopy = Portfolio["copy"]["nav"];

const isActive = (pathname: string, href: string) =>
  href === "/" || href === "/en" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

export function Header({
  locale,
  handle,
  copy,
  lang,
  resenha
}: {
  locale: Locale;
  handle: string;
  copy: NavCopy;
  lang: Portfolio["copy"]["lang"];
  resenha: Portfolio["copy"]["resenha"];
}) {
  const pathname = usePathname();
  const nav = [
    { href: localeHref(locale, "/"), label: copy.index },
    { href: localeHref(locale, "/projects"), label: copy.projects },
    { href: localeHref(locale, "/about"), label: copy.about },
    { href: localeHref(locale, "/contact"), label: copy.contact }
  ];
  const home = localeHref(locale, "/");
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
        <Link href={home} className="label col-span-6 text-fg md:col-span-3" aria-label={`${handle} — ${copy.index}`}>
          <span className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-signal" />
          {handle}
        </Link>

        <nav className="col-span-6 hidden justify-center gap-8 md:flex" aria-label={locale === "en" ? "Main navigation" : "Navegação principal"}>
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

        <div className="col-span-6 flex items-center justify-end gap-4 md:col-span-3">
          <ResenhaToggle work={resenha.work} pub={resenha.pub} label={resenha.toggleLabel} className="hidden lg:inline-flex" />
          {/* Troca de idioma: layouts raiz diferentes, então é navegação completa (sem cortina). */}
          <a
            href={alternateHref(pathname)}
            hrefLang={locale === "en" ? "pt-BR" : "en"}
            data-no-transition
            aria-label={`${lang.switchTo} — ${lang.switchToLabel}`}
            className="label py-2 text-muted transition-colors hover:text-fg"
          >
            {lang.switchTo}
          </a>
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
        inert={!open}
      >
        <ResenhaToggle work={resenha.work} pub={resenha.pub} label={resenha.toggleLabel} className="mb-8 lg:hidden" />
        <nav aria-label={locale === "en" ? "Mobile navigation" : "Navegação móvel"} className="flex flex-col gap-2">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
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

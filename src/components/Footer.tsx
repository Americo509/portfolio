import Link from "next/link";
import { getPortfolio } from "@/lib/get-portfolio";

export function Footer({ params }: { params?: { locale?: string } }) {
  const portfolio = getPortfolio(params?.locale);
  const links = [
    { href: portfolio.links.github, label: "GitHub", external: true },
    { href: portfolio.links.linkedin, label: "LinkedIn", external: true },
    { href: `mailto:${portfolio.links.email}`, label: "Email", external: true },
    { href: "/contact", label: "Contato", external: false }
  ];

  return (
    <footer className="relative z-10 border-t border-line pb-[calc(var(--hud-inset)+40px)] pt-16">
      <div className="grid-editorial gap-y-10">
        <p className="col-span-12 font-display text-[clamp(3rem,9vw,9rem)] md:col-span-8">
          Vamos construir <span className="font-accent text-signal-ink">algo</span> que escala.
        </p>

        <ul className="col-span-12 flex flex-col gap-3 self-end md:col-span-3 md:col-start-10">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                {...(l.external && !l.href.startsWith("mailto:") ? { target: "_blank", rel: "noreferrer" } : {})}
                className="label flex items-center justify-between border-b border-line py-2 text-fg transition-colors hover:text-signal-ink"
              >
                {l.label}
                <span aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="label col-span-12 flex flex-col justify-between gap-2 text-muted sm:flex-row">
          <span>
            © {new Date().getFullYear()} {portfolio.profile.name}
          </span>
          <span>{portfolio.education.title}</span>
        </div>
      </div>
    </footer>
  );
}

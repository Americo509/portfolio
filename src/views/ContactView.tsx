import { ContactForm } from "@/components/contact/ContactForm";
import { ChapterTitle } from "@/components/home/ChapterTitle";
import { getPortfolio } from "@/lib/get-portfolio";
import type { Locale } from "@/lib/i18n";

/** Pós-jogo: o formulário de contato (a lógica da API não muda). */
export function ContactView({ locale }: { locale: Locale }) {
  const portfolio = getPortfolio(locale);
  const { copy, links } = portfolio;
  const cc = copy.contactPage;
  const items = [
    { href: links.github, label: "GitHub" },
    { href: links.linkedin, label: "LinkedIn" },
    { href: `mailto:${links.email}`, label: links.email }
  ];
  return (
    <section className="pb-24 pt-28 sm:pt-32">
      <h1 className="sr-only">{cc.title}</h1>
      <ChapterTitle number="90'" total="+3'" title={cc.title} kicker={cc.kicker} />
      <div className="grid-editorial mt-10 gap-y-12">
        <div className="col-span-12 md:col-span-4">
          <h2 className="text-[clamp(1.6rem,3vw,2.6rem)] leading-tight">{cc.heading}</h2>
          <p className="mt-4 max-w-[40ch] text-muted">{cc.description}</p>
          <div className="mt-10 border-t border-line pt-6">
            <p className="label text-muted">{cc.links}</p>
            <ul className="mt-4 space-y-3">
              {items.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="label flex items-center justify-between border-b border-line py-2 text-fg hover:text-signal-ink"
                  >
                    {l.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-span-12 md:col-span-7 md:col-start-6">
          <ContactForm copy={copy.contactForm} />
        </div>
      </div>
    </section>
  );
}

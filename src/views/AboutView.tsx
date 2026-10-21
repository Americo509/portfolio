import { Button } from "@/components/ui/Button";
import { ChapterTitle } from "@/components/home/ChapterTitle";
import { CareerTimeline } from "@/components/about/CareerTimeline";
import { OffTheClock } from "@/components/resenha/OffTheClock";
import { getPortfolio } from "@/lib/get-portfolio";
import { localeHref, type Locale } from "@/lib/i18n";

/** Ficha do jogador. */
export function AboutView({ locale }: { locale: Locale }) {
  const portfolio = getPortfolio(locale);
  const { copy, profile } = portfolio;
  const ac = copy.aboutPage;
  const paragraphs = profile.bioLong.split(/\n\s*\n/).map((p) => p.trim());

  return (
    <section className="pb-24 pt-28 sm:pt-32">
      <h1 className="sr-only">
        {ac.title} — {profile.name}
      </h1>
      <ChapterTitle number="#08" total="11" title={ac.title} kicker={ac.kicker} />

      <div className="grid-editorial mt-10 gap-y-12">
        <div className="col-span-12 md:col-span-4">
          <div className="border-t border-line pt-6">
            <p className="font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-[0.9]">{profile.name}</p>
            <p className="label mt-4 leading-relaxed text-muted">{profile.headlineBase}</p>
            <dl className="mt-8 space-y-4">
              <div>
                <dt className="label text-muted">{ac.education}</dt>
                <dd className="mt-1">{portfolio.education.title}</dd>
                <dd className="mt-1 text-sm text-muted">{portfolio.education.detail}</dd>
              </div>
              <div>
                <dt className="label text-muted">📍</dt>
                <dd className="mt-1">{profile.location}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="col-span-12 space-y-6 md:col-span-7 md:col-start-6">
          <p className="label text-fg">{ac.who}</p>
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "text-[clamp(1.25rem,2vw,1.7rem)] leading-snug" : "max-w-[62ch] text-muted"}>
              {p}
            </p>
          ))}
        </div>

        <div className="col-span-12 border-t border-line pt-8">
          <p className="label text-fg">{ac.values}</p>
          <ul className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-4">
            {portfolio.about.values.map((v) => (
              <li key={v.title}>
                <h2 className="text-[1.15rem] leading-tight">{v.title}</h2>
                <p className="mt-3 text-sm text-muted">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-20">
        <CareerTimeline items={portfolio.about.timeline} title={ac.career} />
      </div>

      <div className="mt-24 border-t border-line pt-16">
        <OffTheClock resenha={portfolio.resenha} copy={copy.resenha} />
      </div>

      <div className="grid-editorial mt-20">
        <div className="col-span-12 flex flex-wrap gap-3">
          <Button as="link" href={localeHref(locale, "/contact")}>
            {ac.ctaContact}
          </Button>
          <Button as="link" href={localeHref(locale, "/projects")} variant="secondary">
            {ac.ctaProjects}
          </Button>
        </div>
      </div>
    </section>
  );
}

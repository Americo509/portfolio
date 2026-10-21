import { Button } from "@/components/ui/Button";
import { getPortfolio } from "@/lib/get-portfolio";
import { localeHref, type Locale } from "@/lib/i18n";
import { HeroIntro } from "@/components/home/HeroIntro";
import { ChapterTracker } from "@/components/home/ChapterTracker";
import { ChapterTitle } from "@/components/home/ChapterTitle";
import { Lineup } from "@/components/home/Lineup";
import { MatchReports } from "@/components/home/MatchReports";
import { TeamTalk } from "@/components/home/TeamTalk";
import { Academy } from "@/components/home/Academy";
import { FinalWhistle } from "@/components/home/FinalWhistle";
import { PenaltyGame } from "@/components/penalty/PenaltyGame";

export function HomeView({ locale }: { locale: Locale }) {
  const portfolio = getPortfolio(locale);
  const to = (path: string) => localeHref(locale, path);
  const { copy } = portfolio;
  const sumulas = portfolio.projects.filter((p) => p.tier === "sumula");
  const base = portfolio.projects.filter((p) => p.tier === "base");
  const [first, ...rest] = portfolio.profile.name.split(" ");
  const last = rest.pop() ?? "";
  const middle = rest.join(" ");
  const ch = copy.chapters;

  return (
    <div>
      <ChapterTracker />

      {/* Hero */}
      <section data-chapter="hero" className="relative flex min-h-[100svh] flex-col justify-end overflow-x-clip pb-[calc(var(--hud-inset)+64px)] pt-32">
        {/* Véu de legibilidade: os textos pequenos do hero nunca brigam com os refletores. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-bg/75 via-bg/25 to-transparent md:from-bg/60 md:via-transparent"
        />
        <HeroIntro className="grid-editorial gap-y-10">
          {/* Faixa diagonal alvinegra: no escuro, inverte o nome por onde passa. */}
          <span
            aria-hidden="true"
            data-band
            className="pointer-events-none absolute left-[-15%] top-[46%] z-20 h-[2px] w-[135%] origin-left -rotate-[11deg] bg-fg dark:h-[clamp(26px,4.6vw,78px)] dark:bg-[#F5F5F0] dark:mix-blend-difference"
          />
          <span
            aria-hidden="true"
            data-band
            className="pointer-events-none absolute left-[-15%] top-[calc(46%+clamp(40px,6.4vw,104px))] z-20 h-px w-[135%] origin-left -rotate-[11deg] bg-fg/60"
          />
          <p data-fade className="label col-span-12 max-w-[34ch] text-muted md:col-span-5">
            {portfolio.profile.headlineBase}
          </p>

          <h1 className="skew-on-scroll col-span-12 font-display text-[clamp(4.5rem,16vw,18rem)]">
            <span className="sr-only">{portfolio.profile.name}</span>
            <span aria-hidden="true" className="line-mask block">
              <span data-line className="block">{first}</span>
            </span>
            <span aria-hidden="true" className="line-mask block">
              <span data-line className="block">
                {middle} <span className="font-accent text-[0.62em] text-signal-ink">{last}</span>
              </span>
            </span>
          </h1>

          <p data-fade className="col-span-12 max-w-[30ch] text-[clamp(1.25rem,2vw,1.75rem)] leading-snug md:col-span-6">
            {portfolio.profile.heroHeadline}
          </p>

          <div data-fade className="col-span-12 flex flex-col gap-6 md:col-span-4 md:col-start-9 md:self-end">
            <p className="label leading-relaxed text-muted">{portfolio.profile.heroSubheadline}</p>
            <div className="flex flex-wrap gap-3">
              <Button as="link" href={to("/projects")}>
                {copy.hero.primaryCta}
              </Button>
              <Button as="link" href={to("/contact")} variant="secondary">
                {copy.hero.secondaryCta}
              </Button>
            </div>
          </div>
        </HeroIntro>
      </section>

      {/* 02 — Escalação: a rede vira prancheta */}
      <section data-chapter="lineup" aria-labelledby="ch-lineup" className="pb-32 pt-24">
        <ChapterTitle id="ch-lineup" number={ch.lineup.number} title={ch.lineup.title} kicker={ch.lineup.kicker} />
        <div className="mt-10">
          <Lineup lineup={portfolio.lineup} copy={copy.lineup} />
        </div>
      </section>

      {/* 03 — Jogos históricos: as súmulas */}
      <section data-chapter="matches" aria-labelledby="ch-matches" className="pb-32 pt-24">
        <ChapterTitle id="ch-matches" number={ch.matches.number} title={ch.matches.title} kicker={ch.matches.kicker} />
        <div className="mt-14">
          <MatchReports projects={sumulas} copy={copy} locale={locale} />
        </div>
      </section>

      {/* 04 — Preleção: o método */}
      <section data-chapter="method" aria-labelledby="ch-method" className="pb-32 pt-24">
        <ChapterTitle id="ch-method" number={ch.method.number} title={ch.method.title} kicker={ch.method.kicker} />
        <div className="mt-14">
          <TeamTalk method={portfolio.method} principles={portfolio.principles} />
        </div>
      </section>

      {/* 05 — Categorias de base */}
      <section data-chapter="academy" aria-labelledby="ch-academy" className="pb-24 pt-24">
        <ChapterTitle id="ch-academy" number={ch.academy.number} title={ch.academy.title} kicker={ch.academy.kicker} />
        <div className="mt-10">
          <Academy projects={base} openLabel={copy.matchCard.open} locale={locale} />
        </div>
      </section>

      {/* 06 — Disputa de pênaltis (uma cobrança aqui; a disputa completa em /penalti) */}
      <section data-chapter="penalties" aria-labelledby="ch-penalties" className="pb-24 pt-24">
        <ChapterTitle id="ch-penalties" number={ch.penalties.number} title={ch.penalties.title} kicker={ch.penalties.kicker} />
        <div className="grid-editorial mt-10">
          <p className="col-span-12 max-w-[52ch] text-[clamp(1.1rem,1.6vw,1.35rem)] leading-snug text-muted md:col-span-5">
            {copy.penalty.intro}
          </p>
          <PenaltyGame copy={copy.penalty} mode="single" locale={locale} className="col-span-12 mt-8 md:col-span-10 md:col-start-2" />
        </div>
      </section>

      {/* 07 — Apito final */}
      <section data-chapter="final" aria-label={ch.final.title} className="relative">
        <FinalWhistle copy={copy.final} email={portfolio.links.email} locale={locale} resenha={portfolio.resenha} resenhaCopy={copy.resenha} />
      </section>
    </div>
  );
}

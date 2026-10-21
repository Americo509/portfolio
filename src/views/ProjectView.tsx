import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FxImage } from "@/components/fx/FxImage";
import { ProjectGallery } from "@/components/ProjectGallery";
import { BlueprintCover } from "@/components/projects/BlueprintCover";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { getPortfolio } from "@/lib/get-portfolio";
import { localeHref, type Locale } from "@/lib/i18n";

const minute = (i: number, n: number) => `${String(Math.round(((i + 1) * 90) / (n + 1))).padStart(2, "0")}'`;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-4 border-t border-line pt-6 md:grid-cols-[12rem_1fr]">
      <h2 className="label text-fg">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

/** Súmula completa: o case study como relatório de partida. */
export function ProjectView({ locale, slug }: { locale: Locale; slug: string }) {
  const portfolio = getPortfolio(locale);
  const { copy } = portfolio;
  const mr = copy.matchReport;
  const index = portfolio.projects.findIndex((x) => x.slug === slug);
  const p = portfolio.projects[index];
  if (!p) notFound();
  const sumulas = portfolio.projects.filter((x) => x.tier === p.tier);
  const next = sumulas[(sumulas.findIndex((x) => x.slug === slug) + 1) % sumulas.length];
  const cs = p.caseStudy;

  return (
    <article className="pb-24 pt-32 sm:pt-40">
      <header className="grid-editorial gap-y-6">
        <Link href={localeHref(locale, "/projects")} className="label col-span-12 text-muted hover:text-fg">
          {mr.back}
        </Link>
        <div className="label col-span-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-muted">
          <span className="text-fg">
            {mr.title} · #{String(index + 1).padStart(2, "0")}
          </span>
          <StatusBadge project={p} copy={copy} />
          <span>
            {mr.competition}: {p.competition}
          </span>
          <span>
            {mr.position}: {p.position}
          </span>
        </div>
        <h1 className="col-span-12 font-display text-chapter leading-[0.85]">{p.title}</h1>
        <p className="col-span-12 max-w-[52ch] text-[clamp(1.15rem,1.8vw,1.5rem)] leading-snug md:col-span-8">{p.summary}</p>
      </header>

      <div className="grid-editorial mt-12">
        <div className="relative col-span-12 aspect-[16/9] border border-line">
          {p.cover ? (
            <FxImage src={p.cover.src} alt={p.cover.alt} className="absolute inset-0" sizes="100vw" priority />
          ) : (
            <BlueprintCover slug={p.slug} label={`${mr.title} · ${p.title}`} />
          )}
        </div>
      </div>

      <div className="grid-editorial mt-16 gap-y-12">
        <div className="col-span-12 space-y-10 lg:col-span-8">
          <Block title={mr.context}>
            <p className="max-w-[60ch] whitespace-pre-line text-muted">{cs.context}</p>
          </Block>
          <Block title={mr.role}>
            <p className="max-w-[60ch] text-muted">{cs.role}</p>
          </Block>
          <Block title={mr.keyMoments}>
            <ol className="space-y-3">
              {cs.technicalDecisions.map((d, i) => (
                <li key={d} className="grid grid-cols-[3.5rem_1fr] gap-2">
                  <span className="label tabular-nums text-signal-ink">{minute(i, cs.technicalDecisions.length)}</span>
                  <span className="text-muted">{d}</span>
                </li>
              ))}
            </ol>
          </Block>
          {cs.challenges.length > 0 ? (
            <Block title={mr.var}>
              <ul className="space-y-3">
                {cs.challenges.map((c) => (
                  <li key={c} className="flex gap-3 text-muted">
                    <span aria-hidden="true" className="label mt-1 text-fg">
                      VAR
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </Block>
          ) : null}
          <Block title={mr.fullTime}>
            <ul className="space-y-3">
              {cs.results.map((r) => (
                <li key={r} className="text-[clamp(1.05rem,1.4vw,1.25rem)] leading-snug">
                  {r}
                </li>
              ))}
            </ul>
          </Block>
          {cs.gallery.length > 0 ? (
            <Block title={mr.coverage}>
              <ProjectGallery items={cs.gallery} />
            </Block>
          ) : null}
        </div>

        <aside className="col-span-12 lg:col-span-3 lg:col-start-10">
          <div className="space-y-6 border-t border-line pt-6 lg:sticky lg:top-32">
            <p className="label text-fg">{mr.lineup}</p>
            <ul className="flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li key={s} className="label border border-line px-3 py-2 text-muted">
                  {s}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 pt-2">
              <Button as="link" href={localeHref(locale, "/contact")}>
                {mr.talk}
              </Button>
              {p.links.github && !p.privateRepo ? (
                <Button as="link" href={p.links.github} variant="secondary">
                  {mr.code}
                </Button>
              ) : null}
              {p.links.demo ? (
                <Button as="link" href={p.links.demo} variant="secondary">
                  {mr.live}
                </Button>
              ) : null}
              {p.privateRepo ? (
                <p className="label flex gap-2 leading-relaxed text-muted">
                  <span aria-hidden="true">🔒</span>
                  {copy.privateRepo}
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {next && next.slug !== p.slug ? (
        <Link
          href={localeHref(locale, `/projects/${next.slug}`)}
          className="group mt-24 block border-y border-line py-10"
          data-cursor={copy.matchCard.open}
        >
          <div className="grid-editorial items-center gap-y-4">
            <span className="label col-span-12 text-muted md:col-span-3">{mr.next}</span>
            <span className="col-span-12 font-display text-section leading-[0.9] transition-transform duration-700 ease-cine group-hover:translate-x-3 md:col-span-6">
              {next.title}
            </span>
            {next.cover ? (
              <span className="relative col-span-12 hidden aspect-[16/10] overflow-hidden border border-line md:col-span-3 md:block">
                <Image src={next.cover.src} alt="" fill sizes="25vw" className="object-cover grayscale transition duration-700 group-hover:grayscale-0" />
              </span>
            ) : null}
          </div>
        </Link>
      ) : null}
    </article>
  );
}

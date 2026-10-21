import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/motion/Reveal";
import { getPortfolio } from "@/lib/get-portfolio";
import { buildTitle, buildDescription } from "@/lib/seo";
import { ProjectGallery } from "@/components/ProjectGallery";
import { BlueprintCover } from "@/components/projects/BlueprintCover";
import { StatusBadge } from "@/components/ProjectCard";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const portfolio = getPortfolio(); // PT por padrão
  return portfolio.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const portfolio = getPortfolio();
  const p = portfolio.projects.find((x) => x.slug === slug);

  if (!p) {
    return {
      title: buildTitle("Projeto"),
      description: buildDescription(),
    };
  }

  return {
    title: buildTitle(p.title),
    description: buildDescription(p.summary),
    openGraph: {
      title: p.title,
      description: p.summary,
      type: "article",
    },
  };
}

export default async function ProjectCasePage({ params }: Props) {
  const { slug } = await params;
  const portfolio = getPortfolio();
  const p = portfolio.projects.find((x) => x.slug === slug);

  if (!p) return notFound();
  const mr = portfolio.copy.matchReport;

  return (
    <section className="pt-32 sm:pt-40 pb-20">
      <Container>
        <Reveal>
          <div className="max-w-3xl">
            <Link
              className="focus-ring text-sm text-ink-4 dark:text-paper-1/70 hover:underline underline-offset-4"
              href="/projects"
            >
              {mr.back}
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="label text-fg">{mr.title}</span>
              <StatusBadge project={p} copy={portfolio.copy} />
              <span className="label text-muted">
                {mr.competition}: {p.competition}
              </span>
              <span className="label text-muted">
                {mr.position}: {p.position}
              </span>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
              {p.title}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-ink-4 dark:text-paper-1/70">
              {p.summary}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10 items-start">
          <div className="space-y-8">
            <Reveal>
              <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                <h2 className="text-lg font-semibold tracking-tight">{mr.context}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-4 dark:text-paper-1/70 whitespace-pre-line">
                  {p.caseStudy.context}
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                <h2 className="text-lg font-semibold tracking-tight">{mr.role}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-4 dark:text-paper-1/70 whitespace-pre-line">
                  {p.caseStudy.role}
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                <h2 className="text-lg font-semibold tracking-tight">{mr.keyMoments}</h2>
                <ul className="mt-3 space-y-2 text-sm text-ink-4 dark:text-paper-1/70">
                  {p.caseStudy.technicalDecisions.map((d) => (
                    <li key={d}>• {d}</li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {p.caseStudy.challenges.length > 0 ? (
              <Reveal>
                <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                  <h2 className="text-lg font-semibold tracking-tight">{mr.var}</h2>
                  <ul className="mt-3 space-y-2 text-sm text-ink-4 dark:text-paper-1/70">
                    {p.caseStudy.challenges.map((c) => (
                      <li key={c}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ) : null}

            <Reveal>
              <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                <h2 className="text-lg font-semibold tracking-tight">{mr.fullTime}</h2>
                <ul className="mt-3 space-y-2 text-sm text-ink-4 dark:text-paper-1/70">
                  {p.caseStudy.results.map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                <h2 className="text-lg font-semibold tracking-tight">{mr.coverage}</h2>

                {p.caseStudy.gallery.length > 0 ? (
                  <ProjectGallery items={p.caseStudy.gallery} />
                ) : (
                  <div className="relative mt-4 aspect-[16/10] overflow-hidden border border-line">
                    {p.cover ? (
                      <Image src={p.cover.src} alt={p.cover.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
                    ) : (
                      <BlueprintCover slug={p.slug} label={`${mr.title} · ${p.title}`} />
                    )}
                  </div>
                )}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <aside className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft sticky top-24">
              <h3 className="text-sm font-semibold tracking-tight">{mr.lineup}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-borderSubtle px-3 py-1.5 text-xs text-ink-4 dark:text-paper-1/70"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-2">
                <Button as="link" href="/contact" variant="primary">
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
                  <p className="label mt-2 flex gap-2 leading-relaxed text-muted">
                    <span aria-hidden="true">🔒</span>
                    {portfolio.copy.privateRepo}
                  </p>
                ) : null}
              </div>
            </aside>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
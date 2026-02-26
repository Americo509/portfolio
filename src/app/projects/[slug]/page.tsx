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

  return (
    <section className="pt-12 sm:pt-14 pb-20">
      <Container>
        <Reveal>
          <div className="max-w-3xl">
            <Link
              className="focus-ring text-sm text-ink-4 dark:text-paper-1/70 hover:underline underline-offset-4"
              href="/projects"
            >
              ← Voltar para Projetos
            </Link>

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
                <h2 className="text-lg font-semibold tracking-tight">
                  Contexto e problema
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-4 dark:text-paper-1/70 whitespace-pre-line">
                  {p.caseStudy.context}
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                <h2 className="text-lg font-semibold tracking-tight">Meu papel</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-4 dark:text-paper-1/70 whitespace-pre-line">
                  {p.caseStudy.role}
                </p>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                <h2 className="text-lg font-semibold tracking-tight">
                  Decisões técnicas
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-ink-4 dark:text-paper-1/70">
                  {p.caseStudy.technicalDecisions.map((d) => (
                    <li key={d}>• {d}</li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                <h2 className="text-lg font-semibold tracking-tight">
                  Desafios e soluções
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-ink-4 dark:text-paper-1/70">
                  {p.caseStudy.challenges.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                <h2 className="text-lg font-semibold tracking-tight">Resultados</h2>
                <ul className="mt-3 space-y-2 text-sm text-ink-4 dark:text-paper-1/70">
                  {p.caseStudy.results.map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                <h2 className="text-lg font-semibold tracking-tight">Galeria</h2>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {p.caseStudy.gallery.map((g) => (
                    <div
                      key={g.src}
                      className="relative aspect-[16/10] overflow-hidden rounded-xl2 border border-borderSubtle bg-paper-3 dark:bg-ink-3"
                    >
                      <Image
                        src={g.src}
                        alt={g.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs text-ink-4 dark:text-paper-1/60">
                  Dica: substitua as imagens em <code>/public/images</code>.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <aside className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft sticky top-24">
              <h3 className="text-sm font-semibold tracking-tight">Stack</h3>
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
                  Vamos conversar
                </Button>

                {p.links.github ? (
                  <Button as="link" href={p.links.github} variant="secondary">
                    GitHub →
                  </Button>
                ) : null}

                {p.links.demo ? (
                  <Button as="link" href={p.links.demo} variant="secondary">
                    Demo →
                  </Button>
                ) : null}
              </div>
            </aside>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
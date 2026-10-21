import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SectionHeader } from "@/components/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { getPortfolio } from "@/lib/get-portfolio";
import { buildTitle, buildDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: buildTitle("Sobre"),
  description: buildDescription("Ficha do jogador: o que eu valorizo, como penso produto e minha trajetória.")
};

type PageProps = {
  params?: Promise<{ locale?: string }>;
};

export default async function AboutPage({ params }: PageProps) {
  const { locale } = (await params) ?? {};
  const portfolio = getPortfolio(locale);
  const { values, timeline } = portfolio.about;

  return (
    <section className="pt-32 sm:pt-40 pb-20">
      <Container>
        <SectionHeader
          eyebrow="Sobre"
          title="Engenharia com rigor técnico e visão de produto."
          description="Do domínio e arquitetura do backend à experiência final do usuário, construo sistemas claros, evolutivos e preparados para crescer."
        />

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Reveal>
            <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
              <h2 className="text-lg font-semibold tracking-tight">Quem eu sou</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-4 dark:text-paper-1/70">
                {portfolio.profile.bioLong}
              </p>
              <p className="mt-5 text-xs text-ink-4 dark:text-paper-1/60">
                {portfolio.education.title} — {portfolio.education.detail}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
              <h2 className="text-lg font-semibold tracking-tight">O que eu valorizo</h2>
              <div className="mt-5 space-y-4">
                {values.map((v) => (
                  <div key={v.title}>
                    <h3 className="text-sm font-semibold tracking-tight">{v.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-4 dark:text-paper-1/70">
                      {v.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-10 rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
            <h2 className="text-lg font-semibold tracking-tight">Timeline</h2>
            <div className="mt-6 space-y-4">
              {timeline.map((t) => (
                <div key={`${t.year}-${t.title}`} className="grid grid-cols-[72px_1fr] gap-4">
                  <div className="text-xs font-medium tracking-[0.18em] uppercase text-ink-4 dark:text-paper-1/60">
                    {t.year}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight">{t.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-4 dark:text-paper-1/70">
                      {t.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Button as="link" href="/contact">
            Falar comigo
          </Button>
          <Link className="focus-ring inline-flex items-center rounded-xl2 border border-borderSubtle bg-paper-2/70 dark:bg-ink-2/60 px-5 py-3 text-[15px] hover:bg-paper-3 dark:hover:bg-ink-3 transition" href="/projects">
            Ver projetos →
          </Link>
        </div>
      </Container>
    </section>
  );
}

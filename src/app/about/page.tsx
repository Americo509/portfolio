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
  description: buildDescription("O que eu valorizo, como penso produto e uma timeline com marcos (placeholders).")
};

const values = [
  {
    title: "Qualidade e previsibilidade",
    body: "Eu prefiro sistemas fáceis de manter e de evoluir: contratos claros, testes onde faz sentido, e decisões registradas."
  },
  {
    title: "Performance e acessibilidade",
    body: "Velocidade e inclusão não são extras. Eu considero performance, a11y e UX como parte do produto."
  },
  {
    title: "Segurança e clareza",
    body: "Autenticação, validação, rate limits e logs úteis — sem complicar o essencial."
  },
  {
    title: "DX e colaboração",
    body: "Padrões, automações e documentação prática para o time ganhar tempo — e reduzir bugs."
  }
];

const timeline = [
  {
    year: "2022",
    title: "Base sólida em engenharia e sistemas legados",
    body:
      "Atuação com desenvolvimento em Delphi e sistemas empresariais, consolidando fundamentos em lógica, modelagem de dados, versionamento e práticas de engenharia. Experiência inicial em ambientes reais de produção e ciclos ágeis."
  },
  {
    year: "2023",
    title: "Transição estratégica para arquitetura web moderna",
    body:
      "Migração do foco em sistemas legados para desenvolvimento full stack moderno com React, NestJS e TypeScript. Desenvolvimento de aplicações web escaláveis e aprofundamento em APIs REST, banco relacional e organização modular."
  },
  {
    year: "2024",
    title: "Liderança técnica e arquitetura full-stack",
    body:
      "Atuação como líder de desenvolvimento na Nevra Software, estruturando backend com NestJS, MySQL, Redis e Angular. Criação de APIs seguras, integração com serviços externos e fortalecimento de práticas de arquitetura e CI/CD."
  },
  {
    year: "2024",
    title: "Fundação do YourBest e visão de produto",
    body:
      "Co-fundador e responsável pela arquitetura do YourBest, marketplace mobile desenvolvido em monorepo com React Native (Expo), Next.js e NestJS. Implementação de autenticação robusta, modelagem de domínio e base preparada para crescimento sustentável."
  },
  {
    year: "2025",
    title: "Consolidação como engenheiro orientado a arquitetura",
    body:
      "Foco em sistemas escaláveis, DDD, observabilidade e experiência sem fricção. Evolução contínua em backend, mobile e arquitetura orientada a produto, consolidando atuação como Senior Full Stack Software Engineer."
  }
];

export default function AboutPage({ params }: { params?: { locale?: string } }) {
  const portfolio = getPortfolio(params?.locale);
  return (
    <section className="pt-12 sm:pt-14 pb-20">
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
                <div key={t.year} className="grid grid-cols-[72px_1fr] gap-4">
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

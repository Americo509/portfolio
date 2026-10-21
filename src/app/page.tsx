import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/motion/Reveal";
import { getPortfolio } from "@/lib/get-portfolio";
import { HeroIntro } from "@/components/home/HeroIntro";

type PageProps = {
  params?: Promise<{ locale?: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale } = (await params) ?? {};
  const portfolio = getPortfolio(locale);

  const featured = portfolio.projects.filter((p) => p.featured).slice(0, 3);
  const wide = featured.find((p) => p.featuredSize === "wide") ?? featured[0];
  const normals = featured.filter((p) => p.slug !== wide.slug);
  const [first, ...rest] = portfolio.profile.name.split(" ");
  const last = rest.pop() ?? "";
  const middle = rest.join(" ");

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col justify-end pb-[calc(var(--hud-inset)+64px)] pt-32">
        <HeroIntro className="grid-editorial gap-y-10">
          <p data-fade className="label col-span-12 max-w-[34ch] text-muted md:col-span-5">
            {portfolio.profile.headlineBase}
          </p>

          <h1 className="col-span-12 font-display text-[clamp(4.5rem,16vw,18rem)]">
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
              <Button as="link" href="/projects">
                Ver projetos
              </Button>
              <Button as="link" href="/contact" variant="secondary">
                Falar comigo
              </Button>
            </div>
          </div>
        </HeroIntro>
      </section>

      {/* Featured Projects */}
      <section className="pt-14 sm:pt-18">
        <Container>
          <SectionHeader
            eyebrow="Destaques"
            title="Projetos com foco em produto, arquitetura e entrega."
            description="Cases selecionados para mostrar decisões técnicas, trade-offs e acabamento."
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <ProjectCard project={wide} variant="wide" />
            {normals.map((p) => (
              <ProjectCard key={p.slug} project={p} variant="normal" />
            ))}
          </div>

          <div className="mt-8">
            <Button as="link" href="/projects" variant="ghost">
              Ver todos os projetos →
            </Button>
          </div>
        </Container>
      </section>

      {/* Skills */}
      <section className="pt-14 sm:pt-18">
        <Container>
          <SectionHeader
            eyebrow="Toolbox"
            title="Stack que uso no dia a dia."
            description="Organizada por domínios — com foco em previsibilidade, performance e DX."
          />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolio.skills.map((cat) => (
              <Reveal key={cat.label}>
                <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-6 shadow-soft">
                  <h3 className="text-sm font-semibold tracking-tight">{cat.label}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {cat.items.map((i) => (
                      <Chip key={i}>{i}</Chip>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Impact / Approach */}
      <section className="pt-14 sm:pt-18">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <Reveal>
              <div className="prose-senior">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  Como eu penso produto
                </h2>
                <p className="mt-4">
                  Busco unir base técnica sólida e experiência sem fricção.
                  Isso significa modelagem de domínio clara, contratos bem definidos, observabilidade real
                  em produção e interfaces consistentes.
                  Engenharia, para mim, é criar sistemas previsíveis, evolutivos e bem resolvidos nos
                  detalhes — do backend à experiência final do usuário.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                <h3 className="text-lg font-semibold tracking-tight">Arquitetura e qualidade</h3>
                <ul className="mt-4 space-y-3 text-sm text-ink-4 dark:text-paper-1/70">
                  <li>• Domain-driven modeling e separação clara de responsabilidades.</li>
                  <li>• Service boundaries bem definidos e contratos explícitos entre camadas.</li>
                  <li>• APIs previsíveis e versionamento consciente.</li>
                  <li>• Performance e escalabilidade tratadas como requisitos desde o design.</li>
                  <li>• Observabilidade por padrão (logs estruturados, tracing e métricas acionáveis).</li>
                  <li>• Resiliência: retries, timeouts e tratamento consistente de falhas.</li>
                  <li>• Código evolutivo com baixo acoplamento e alta coesão.</li>
                  <li>• Developer Experience forte: automação, padrões e testes que sustentam crescimento.</li>
                </ul>
                <div className="mt-6">
                  <Link className="focus-ring text-sm underline decoration-borderSubtle underline-offset-4 hover:decoration-ink-4 dark:hover:decoration-paper-1/80" href="/about">
                    Ler sobre minha abordagem →
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Short About */}
      <section className="pt-14 sm:pt-18">
        <Container>
          <SectionHeader
            eyebrow="Sobre"
            title="Cuidado com detalhes. Pragmatismo na entrega."
            description={portfolio.profile.bioShort}
          />
          <div className="mt-7">
            <Button as="link" href="/about" variant="secondary">
              Ir para tela sobre
            </Button>
          </div>
        </Container>
      </section>

      {/* Contact */}
      <section className="pt-14 sm:pt-18 pb-20">
        <Container>
          <SectionHeader
            eyebrow="Contato"
            title="Vamos conversar."
            description="Me conte sobre o produto, o problema e o prazo. Eu respondo com clareza e próximos passos."
          />
          <div className="mt-8">
            <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-6 sm:p-7 shadow-soft">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-ink-4 dark:text-paper-1/70">
                  Prefere ir direto?{" "}
                  <a className="underline decoration-borderSubtle underline-offset-4 hover:decoration-ink-4 dark:hover:decoration-paper-1/80" href={`mailto:${portfolio.links.email}`}>
                    {portfolio.links.email}
                  </a>
                </p>
                <div className="flex gap-2">
                  <Button as="link" href={portfolio.links.github} variant="ghost">
                    GitHub
                  </Button>
                  <Button as="link" href={portfolio.links.linkedin} variant="ghost">
                    LinkedIn
                  </Button>
                  <Button as="link" href="/contact" variant="secondary">
                    Abrir formulário →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

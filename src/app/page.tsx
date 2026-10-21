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

  const { copy } = portfolio;
  const featured = portfolio.projects.filter((p) => p.featured).slice(0, 3);
  const wide = featured.find((p) => p.featuredSize === "wide") ?? featured[0];
  const normals = featured.filter((p) => p.slug !== wide.slug);
  const [first, ...rest] = portfolio.profile.name.split(" ");
  const last = rest.pop() ?? "";
  const middle = rest.join(" ");

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-x-clip pb-[calc(var(--hud-inset)+64px)] pt-32">
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
              <Button as="link" href="/projects">
                {copy.hero.primaryCta}
              </Button>
              <Button as="link" href="/contact" variant="secondary">
                {copy.hero.secondaryCta}
              </Button>
            </div>
          </div>
        </HeroIntro>
      </section>

      {/* Featured Projects */}
      <section className="pt-14 sm:pt-18">
        <Container>
          <SectionHeader
            eyebrow={copy.sections.featured.eyebrow}
            title={copy.sections.featured.title}
            description={copy.sections.featured.description}
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <ProjectCard project={wide} variant="wide" copy={copy} />
            {normals.map((p) => (
              <ProjectCard key={p.slug} project={p} variant="normal" copy={copy} />
            ))}
          </div>

          <div className="mt-8">
            <Button as="link" href="/projects" variant="ghost">
              {copy.sections.featured.cta}
            </Button>
          </div>
        </Container>
      </section>

      {/* Skills */}
      <section className="pt-14 sm:pt-18">
        <Container>
          <SectionHeader
            eyebrow={copy.sections.toolbox.eyebrow}
            title={copy.sections.toolbox.title}
            description={copy.sections.toolbox.description}
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
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{portfolio.principles.title}</h2>
                <p className="mt-4">{portfolio.principles.body}</p>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
                <h3 className="label text-muted">
                  {portfolio.method.title} · {portfolio.method.steps.length} {portfolio.locale === "en" ? "steps" : "fases"}
                </h3>
                <ol className="mt-4 space-y-3 text-sm text-ink-4 dark:text-paper-1/70">
                  {portfolio.method.steps.map((step) => (
                    <li key={step.number}>
                      <span className="label mr-2 text-fg">
                        {`${step.number} // ${step.name}`}
                      </span>
                      {step.body}
                    </li>
                  ))}
                </ol>
                <ul className="mt-6 space-y-2 border-t border-line pt-6 text-sm text-ink-4 dark:text-paper-1/70">
                  {portfolio.principles.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link className="focus-ring text-sm underline decoration-borderSubtle underline-offset-4 hover:decoration-ink-4 dark:hover:decoration-paper-1/80" href="/about">
                    {copy.sections.about.cta} →
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
            eyebrow={copy.sections.about.eyebrow}
            title={copy.sections.about.title}
            description={portfolio.profile.bioShort}
          />
          <div className="mt-7">
            <Button as="link" href="/about" variant="secondary">
              {copy.sections.about.cta}
            </Button>
          </div>
        </Container>
      </section>

      {/* Contact */}
      <section className="pt-14 sm:pt-18 pb-20">
        <Container>
          <SectionHeader
            eyebrow={copy.sections.contact.eyebrow}
            title={copy.sections.contact.title}
            description={copy.sections.contact.description}
          />
          <div className="mt-8">
            <div className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-6 sm:p-7 shadow-soft">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-ink-4 dark:text-paper-1/70">
                  {copy.sections.contact.direct}{" "}
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
                    {copy.sections.contact.form}
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

import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeader } from "@/components/SectionHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { getPortfolio } from "@/lib/get-portfolio";
import { buildTitle, buildDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: buildTitle("Contato"),
  description: buildDescription("Formulário de contato com validação e estado de sucesso.")
};

export default function ContactPage({ params }: { params?: { locale?: string } }) {
  const portfolio = getPortfolio(params?.locale);
  return (
    <section className="pt-12 sm:pt-14 pb-20">
      <Container>
        <SectionHeader
          eyebrow="Contato"
          title="Vamos construir algo bom."
          description="Envie uma mensagem. Se preferir, pode mandar email direto."
        />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-8 items-start">
          <ContactForm />
          <aside className="rounded-xl2 border border-borderSubtle bg-paper-2/50 dark:bg-ink-2/40 p-7 shadow-soft">
            <h3 className="text-sm font-semibold tracking-tight">Links</h3>
            <div className="mt-4 space-y-3 text-sm">
              <a className="focus-ring block underline decoration-borderSubtle underline-offset-4 hover:decoration-ink-4 dark:hover:decoration-paper-1/80" href={portfolio.links.github}>
                GitHub
              </a>
              <a className="focus-ring block underline decoration-borderSubtle underline-offset-4 hover:decoration-ink-4 dark:hover:decoration-paper-1/80" href={portfolio.links.linkedin}>
                LinkedIn
              </a>
              <a className="focus-ring block underline decoration-borderSubtle underline-offset-4 hover:decoration-ink-4 dark:hover:decoration-paper-1/80" href={`mailto:${portfolio.links.email}`}>
                {portfolio.links.email}
              </a>
            </div>

            <p className="mt-6 text-xs text-ink-4 dark:text-paper-1/60">
              Observação: este formulário é frontend-only. Para enviar de verdade, conecte um endpoint (ex.: Next Route Handler) ou um serviço de forms.
            </p>
          </aside>
        </div>
      </Container>
    </section>
  );
}

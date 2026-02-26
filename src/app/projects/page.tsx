import type { Metadata } from "next";
import { buildTitle, buildDescription } from "@/lib/seo";
import { getPortfolio } from "@/lib/get-portfolio";
import { Container } from "@/components/Container";
import { SectionHeader } from "@/components/SectionHeader";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";

export const metadata: Metadata = {
  title: buildTitle("Projetos"),
  description: buildDescription("Grid com busca e filtros por tags. Abra um case study para ver decisões técnicas.")
};

type PageProps = {
  params?: Promise<{ locale?: string }>;
};

export default async function ProjectsPage({ params }: PageProps) {
  const { locale } = (await params) ?? {};
  const portfolio = getPortfolio(locale);

  return (
    <section className="pt-12 sm:pt-14 pb-20">
      <Container>
        <SectionHeader
          eyebrow="Projetos"
          title="Cases, decisões e entregas."
          description="Use busca e filtros. Abra um projeto para ver contexto, papel, decisões técnicas e resultados."
        />
        <div className="mt-8">
          <ProjectsExplorer projects={portfolio.projects} tags={[...portfolio.projectTags]} />
        </div>
      </Container>
    </section>
  );
}

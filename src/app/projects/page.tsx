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

export default function ProjectsPage({ params }: { params?: { locale?: string } }) {
  const portfolio = getPortfolio(params?.locale);
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

import { ChapterTitle } from "@/components/home/ChapterTitle";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { getPortfolio } from "@/lib/get-portfolio";
import type { Locale } from "@/lib/i18n";

export function ProjectsView({ locale }: { locale: Locale }) {
  const portfolio = getPortfolio(locale);
  const pc = portfolio.copy.projectsPage;
  return (
    <section className="pb-24 pt-28 sm:pt-32">
      <h1 className="sr-only">{pc.title}</h1>
      <ChapterTitle number="—" total={String(portfolio.projects.length).padStart(2, "0")} title={pc.title} kicker={pc.kicker} />
      <div className="grid-editorial mt-6">
        <p className="col-span-12 max-w-[52ch] text-muted md:col-span-6">{pc.description}</p>
        <div className="col-span-12 mt-10">
          <ProjectsExplorer projects={portfolio.projects} tags={portfolio.projectTags} copy={portfolio.copy} locale={locale} />
        </div>
      </div>
    </section>
  );
}

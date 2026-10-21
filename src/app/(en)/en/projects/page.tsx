import type { Metadata } from "next";
import { ProjectsView } from "@/views/ProjectsView";
import { getPortfolio } from "@/lib/get-portfolio";
import { pageMetadata } from "@/lib/seo";

const pc = getPortfolio("en").copy.projectsPage;
export const metadata: Metadata = pageMetadata({ locale: "en", path: "/projects", title: pc.title, description: pc.description });

export default function Page() {
  return <ProjectsView locale="en" />;
}

import type { Metadata } from "next";
import { ProjectView } from "@/views/ProjectView";
import { getPortfolio } from "@/lib/get-portfolio";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPortfolio("pt").projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPortfolio("pt").projects.find((x) => x.slug === slug);
  return pageMetadata({ locale: "pt", path: `/projects/${slug}`, title: p?.title, description: p?.summary, type: "article" });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProjectView locale="pt" slug={slug} />;
}

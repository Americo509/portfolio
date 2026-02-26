import { getPortfolio } from "@/lib/get-portfolio";

export default function sitemap(params?: { locale?: string }) {
  const portfolio = getPortfolio(params?.locale);
  const base = "https://example.com";
  const staticRoutes = ["", "/projects", "/about", "/contact"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date()
  }));

  const projectRoutes = portfolio.projects.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: new Date()
  }));

  return [...staticRoutes, ...projectRoutes];
}

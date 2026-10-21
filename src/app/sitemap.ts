import type { MetadataRoute } from "next";
import { getPortfolio } from "@/lib/get-portfolio";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const portfolio = getPortfolio();
  const staticRoutes = ["", "/projects", "/about", "/contact"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date()
  }));

  const projectRoutes = portfolio.projects.map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified: new Date()
  }));

  return [...staticRoutes, ...projectRoutes];
}

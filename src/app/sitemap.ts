import type { MetadataRoute } from "next";
import { getPortfolio } from "@/lib/get-portfolio";
import { LOCALES, localeHref } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/projects", "/about", "/contact", "/penalti", ...getPortfolio().projects.map((p) => `/projects/${p.slug}`)];
  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localeHref(locale, path)}`,
      lastModified: new Date(),
      alternates: { languages: { "pt-BR": `${SITE_URL}${localeHref("pt", path)}`, en: `${SITE_URL}${localeHref("en", path)}` } }
    }))
  );
}

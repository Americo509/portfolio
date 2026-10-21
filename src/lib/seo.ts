import type { Metadata } from "next";
import { getPortfolio } from "@/lib/get-portfolio";
import { localeHref, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export function buildTitle(page?: string, locale: Locale = "pt") {
  const portfolio = getPortfolio(locale);
  const base = portfolio.profile.name;
  if (!page) return `${base} — ${portfolio.profile.headlineBase}`;
  return `${page} — ${base}`;
}

export function buildDescription(fallback?: string, locale: Locale = "pt") {
  return fallback ?? getPortfolio(locale).profile.bioShort;
}

/** Metadados de uma página com o par PT/EN (hreflang) e a URL canônica. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  type = "website"
}: {
  locale: Locale;
  path: string;
  title?: string;
  description?: string;
  type?: "website" | "article";
}): Metadata {
  const fullTitle = buildTitle(title, locale);
  const desc = buildDescription(description, locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: title ? { absolute: fullTitle } : fullTitle,
    description: desc,
    alternates: {
      canonical: `${SITE_URL}${localeHref(locale, path)}`,
      languages: { "pt-BR": `${SITE_URL}${localeHref("pt", path)}`, en: `${SITE_URL}${localeHref("en", path)}` }
    },
    openGraph: { title: fullTitle, description: desc, type, locale: locale === "en" ? "en_GB" : "pt_BR" }
  };
}

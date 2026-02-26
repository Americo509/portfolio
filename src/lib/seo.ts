import { getPortfolio } from "@/lib/get-portfolio";

export function buildTitle(page?: string, params?: { locale?: string }) {
  const portfolio = getPortfolio(params?.locale);
  const base = portfolio.profile.name;
  if (!page) return `${base} — ${portfolio.profile.headlineBase}`;
  return `${page} — ${base}`;
}

export function buildDescription(fallback?: string, params?: { locale?: string }) {
  const portfolio = getPortfolio(params?.locale);
  return fallback ?? portfolio.profile.bioShort;
}

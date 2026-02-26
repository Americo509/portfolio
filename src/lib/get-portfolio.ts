import { portfolioPT } from "@/data/i18n/portfolio.pt";
import { portfolioEN } from "@/data/i18n/portfolio.en";

export function getPortfolio(locale?: string) {
  return locale === "en" ? portfolioEN : portfolioPT;
}
import fs from "node:fs";
import path from "node:path";
import { portfolioPT } from "@/data/i18n/portfolio.pt";
import { portfolioEN } from "@/data/i18n/portfolio.en";
import type { Portfolio } from "@/types/portfolio.types";

// Só no servidor (usa fs). Mídias declaradas nos dados que ainda não existem em
// /public (key arts e fotos da resenha) são removidas aqui, e a UI cai nos
// fallbacks (BlueprintCover, cromos de placeholder) em vez de quebrar a imagem.
const exists = (src: string) => fs.existsSync(path.join(process.cwd(), "public", src));

function withAvailableMedia(p: Portfolio): Portfolio {
  return {
    ...p,
    projects: p.projects.map((project) => ({
      ...project,
      cover: project.cover && exists(project.cover.src) ? project.cover : undefined,
      caseStudy: { ...project.caseStudy, gallery: project.caseStudy.gallery.filter((g) => exists(g.src)) }
    })),
    resenha: {
      ...p.resenha,
      cards: p.resenha.cards.map((c) => ({ ...c, src: exists(c.src) ? c.src : "" }))
    }
  };
}

const cache = new Map<string, Portfolio>();

export function getPortfolio(locale?: string): Portfolio {
  const key = locale === "en" ? "en" : "pt";
  let data = cache.get(key);
  if (!data) {
    data = withAvailableMedia(key === "en" ? portfolioEN : portfolioPT);
    cache.set(key, data);
  }
  return data;
}

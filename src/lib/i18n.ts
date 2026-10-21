export type Locale = "pt" | "en";

export const LOCALES: Locale[] = ["pt", "en"];

export const htmlLang = (l: Locale) => (l === "en" ? "en" : "pt-BR");

/** Caminho interno no idioma: o português fica na raiz e o inglês em /en. */
export function localeHref(l: Locale, path: string) {
  if (l === "pt") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

/** Mesmo endereço no outro idioma (para o seletor PT/EN). */
export function alternateHref(pathname: string) {
  if (pathname === "/en" || pathname.startsWith("/en/")) return pathname.slice(3) || "/";
  return pathname === "/" ? "/en" : `/en${pathname}`;
}

export const localeFromPath = (pathname: string): Locale =>
  pathname === "/en" || pathname.startsWith("/en/") ? "en" : "pt";

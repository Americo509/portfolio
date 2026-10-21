// URL pública do site (metadataBase, sitemap, robots). Defina NEXT_PUBLIC_SITE_URL em produção.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

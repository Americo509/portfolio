import type { Metadata } from "next";
import { AboutView } from "@/views/AboutView";
import { getPortfolio } from "@/lib/get-portfolio";
import { pageMetadata } from "@/lib/seo";

const p = getPortfolio("en");
export const metadata: Metadata = pageMetadata({ locale: "en", path: "/about", title: p.copy.aboutPage.title, description: p.profile.bioShort });

export default function Page() {
  return <AboutView locale="en" />;
}

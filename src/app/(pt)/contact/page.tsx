import type { Metadata } from "next";
import { ContactView } from "@/views/ContactView";
import { getPortfolio } from "@/lib/get-portfolio";
import { pageMetadata } from "@/lib/seo";

const cc = getPortfolio("pt").copy.contactPage;
export const metadata: Metadata = pageMetadata({ locale: "pt", path: "/contact", title: cc.title, description: cc.description });

export default function Page() {
  return <ContactView locale="pt" />;
}

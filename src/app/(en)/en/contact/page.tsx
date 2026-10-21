import type { Metadata } from "next";
import { ContactView } from "@/views/ContactView";
import { getPortfolio } from "@/lib/get-portfolio";
import { pageMetadata } from "@/lib/seo";

const cc = getPortfolio("en").copy.contactPage;
export const metadata: Metadata = pageMetadata({ locale: "en", path: "/contact", title: cc.title, description: cc.description });

export default function Page() {
  return <ContactView locale="en" />;
}

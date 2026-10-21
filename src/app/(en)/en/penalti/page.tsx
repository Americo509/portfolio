import type { Metadata } from "next";
import { PenaltyView } from "@/views/PenaltyView";
import { getPortfolio } from "@/lib/get-portfolio";
import { pageMetadata } from "@/lib/seo";

const pen = getPortfolio("en").copy.penalty;
export const metadata: Metadata = pageMetadata({ locale: "en", path: "/penalti", title: pen.title, description: pen.intro });

export default function Page() {
  return <PenaltyView locale="en" />;
}

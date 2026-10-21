import type { Metadata } from "next";
import Link from "next/link";
import { getPortfolio } from "@/lib/get-portfolio";
import { buildTitle, buildDescription } from "@/lib/seo";
import { PenaltyGame } from "@/components/penalty/PenaltyGame";

const portfolio = getPortfolio();

export const metadata: Metadata = {
  title: buildTitle(portfolio.copy.penalty.title),
  description: buildDescription(portfolio.copy.penalty.intro)
};

export default function PenaltyPage() {
  const { copy } = portfolio;
  return (
    <section className="pb-24 pt-32 sm:pt-40">
      <div className="grid-editorial gap-y-8">
        <div className="col-span-12 md:col-span-8">
          <Link href="/" className="label text-muted hover:text-fg">
            ← {copy.nav.index}
          </Link>
          <h1 className="mt-6 font-display text-chapter leading-[0.85]">{copy.penalty.title}</h1>
          <p className="mt-6 max-w-[52ch] text-[clamp(1.1rem,1.6vw,1.35rem)] leading-snug text-muted">{copy.penalty.intro}</p>
        </div>
        <PenaltyGame copy={copy.penalty} mode="full" className="col-span-12" />
      </div>
    </section>
  );
}

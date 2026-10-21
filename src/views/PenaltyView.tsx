import Link from "next/link";
import { getPortfolio } from "@/lib/get-portfolio";
import { localeHref, type Locale } from "@/lib/i18n";
import { PenaltyGame } from "@/components/penalty/PenaltyGame";

export function PenaltyView({ locale }: { locale: Locale }) {
  const { copy } = getPortfolio(locale);
  return (
    <section className="pb-24 pt-32 sm:pt-40">
      <div className="grid-editorial gap-y-8">
        <div className="col-span-12 md:col-span-8">
          <Link href={localeHref(locale, "/")} className="label text-muted hover:text-fg">
            ← {copy.nav.index}
          </Link>
          <h1 className="mt-6 font-display text-chapter leading-[0.85]">{copy.penalty.title}</h1>
          <p className="mt-6 max-w-[52ch] text-[clamp(1.1rem,1.6vw,1.35rem)] leading-snug text-muted">{copy.penalty.intro}</p>
        </div>
        <PenaltyGame copy={copy.penalty} mode="full" locale={locale} className="col-span-12" />
      </div>
    </section>
  );
}

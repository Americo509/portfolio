import { Button } from "@/components/ui/Button";
import { OffTheClock } from "@/components/resenha/OffTheClock";
import { ResenhaInvite } from "@/components/resenha/ResenhaInvite";
import { localeHref, type Locale } from "@/lib/i18n";
import type { Portfolio, Resenha } from "@/types/portfolio.types";

/**
 * Apito final: os refletores apagam (a câmera cuida disso) e sobra o
 * sinalizador, que vira o CTA. No Modo Resenha, o pós-jogo abre o "Fora do terminal".
 */
export function FinalWhistle({
  copy,
  email,
  locale,
  resenha,
  resenhaCopy
}: {
  copy: Portfolio["copy"]["final"];
  email: string;
  locale: Locale;
  resenha: Resenha;
  resenhaCopy: Portfolio["copy"]["resenha"];
}) {
  return (
    <>
      <div className="grid-editorial min-h-[110svh] content-center gap-y-10">
        <h2 className="col-span-12 font-display text-chapter leading-[0.82]">
          {copy.title}
          <span className="mt-2 block font-accent text-[0.42em] normal-case leading-tight text-signal-ink">{copy.accent}</span>
        </h2>
        <p className="col-span-12 max-w-[44ch] text-[clamp(1.1rem,1.6vw,1.35rem)] leading-snug text-muted md:col-span-6">{copy.body}</p>
        <div className="col-span-12 flex flex-col gap-6 md:col-span-5 md:col-start-8 md:self-end">
          <div className="flex flex-wrap gap-3">
            <Button as="link" href={localeHref(locale, "/contact")}>
              {copy.cta}
            </Button>
            <Button as="link" href={localeHref(locale, "/about")} variant="secondary">
              {copy.secondary}
            </Button>
          </div>
          <p className="label text-muted">
            {copy.email}{" "}
            <a className="text-fg underline decoration-fg/30 underline-offset-4 hover:decoration-signal" href={`mailto:${email}`}>
              {email}
            </a>
          </p>
          <ResenhaInvite label={resenhaCopy.invite} className="expediente-only" />
        </div>
      </div>
      <div className="resenha-only pb-32">
        <OffTheClock resenha={resenha} copy={resenhaCopy} />
      </div>
    </>
  );
}

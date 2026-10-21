import { Button } from "@/components/ui/Button";
import { getPortfolio } from "@/lib/get-portfolio";
import { localeHref, type Locale } from "@/lib/i18n";
import { buildTitle } from "@/lib/seo";

export function NotFoundView({ locale }: { locale: Locale }) {
  const { copy } = getPortfolio(locale);
  return (
    <section className="grid-editorial min-h-[80svh] content-center gap-y-8 pb-24 pt-40">
      {/* O notFound() do catch-all perde o <title> dos metadados na hidratação: o React 19 eleva este ao <head>. */}
      <title>{buildTitle(`404 · ${copy.notFound.title.replace(/\.$/, "")}`, locale)}</title>
      <h1 className="col-span-12 font-display text-chapter">{copy.notFound.title}</h1>
      <p className="col-span-12 max-w-[40ch] text-muted">{copy.notFound.body}</p>
      <div className="col-span-12 flex flex-wrap gap-3">
        <Button as="link" href={localeHref(locale, "/")} variant="primary">
          {copy.notFound.home}
        </Button>
        <Button as="link" href={localeHref(locale, "/projects")} variant="secondary">
          {copy.notFound.projects}
        </Button>
      </div>
    </section>
  );
}

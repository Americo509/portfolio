import Link from "next/link";
import { Container } from "@/components/Container";
import { getPortfolio } from "@/lib/get-portfolio";

export function Footer({ params }: { params?: { locale?: string } }) {
  const portfolio = getPortfolio(params?.locale);
  return (
    <footer className="border-t border-borderSubtle">
      <Container className="py-10">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-ink-4 dark:text-paper-1/70">
              © {new Date().getFullYear()} {portfolio.profile.name}
            </p>
            <p className="mt-1 text-xs text-ink-4/80 dark:text-paper-1/50">
              {portfolio.education.title}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link className="focus-ring underline decoration-borderSubtle underline-offset-4 hover:decoration-ink-4 dark:hover:decoration-paper-1/80" href={portfolio.links.github}>
              GitHub
            </Link>
            <Link className="focus-ring underline decoration-borderSubtle underline-offset-4 hover:decoration-ink-4 dark:hover:decoration-paper-1/80" href={portfolio.links.linkedin}>
              LinkedIn
            </Link>
            <Link className="focus-ring underline decoration-borderSubtle underline-offset-4 hover:decoration-ink-4 dark:hover:decoration-paper-1/80" href="/contact">
              Contato
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

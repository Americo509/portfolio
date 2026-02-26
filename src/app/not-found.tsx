import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="pt-16 pb-24">
      <Container>
        <h1 className="text-3xl font-semibold tracking-tight">Página não encontrada</h1>
        <p className="mt-3 text-ink-4 dark:text-paper-1/70">
          O conteúdo que você tentou acessar não existe (ou foi movido).
        </p>
        <div className="mt-6 flex gap-3">
          <Button as="link" href="/" variant="primary">
            Voltar para Home
          </Button>
          <Button as="link" href="/projects" variant="secondary">
            Ver projetos
          </Button>
        </div>
      </Container>
    </section>
  );
}

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { getPortfolio } from "@/lib/get-portfolio";

export default function NotFound() {
  const { copy } = getPortfolio();
  return (
    <section className="pb-24 pt-40">
      <Container>
        <h1 className="font-display text-chapter">{copy.notFound.title}</h1>
        <p className="mt-6 max-w-[40ch] text-muted">{copy.notFound.body}</p>
        <div className="mt-6 flex gap-3">
          <Button as="link" href="/" variant="primary">
            {copy.notFound.home}
          </Button>
          <Button as="link" href="/projects" variant="secondary">
            {copy.notFound.projects}
          </Button>
        </div>
      </Container>
    </section>
  );
}

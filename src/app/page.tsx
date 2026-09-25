import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function Home() {
  return (
    <main>
      <Container className="py-24">
        <p className="text-supporting text-muted">
          Estúdio de odontologia estética nos Jardins, em São Paulo.
        </p>
        <h1 className="mt-6 max-w-[14ch] font-display text-display font-light">
          Estética dental com a naturalidade da luz.
        </h1>
        <p className="mt-6 max-w-[56ch] text-supporting text-muted">
          Avaliação, lentes, facetas é clareamento — tipografia com acentos: ã õ
          ç é ê í ú.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href="#">Agendar avaliação</ButtonLink>
          <Button variant="secondary">Conhecer tratamentos</Button>
          <ButtonLink href="#" variant="ghost">
            Ver o método
          </ButtonLink>
          <span className="font-mono text-caption">A1 · B1 · BL1</span>
        </div>
      </Container>
    </main>
  );
}

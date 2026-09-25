import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { Hero } from "@/components/sections/hero";
import { Principle } from "@/components/sections/principle";
import { Treatments } from "@/components/sections/treatments";
import { Container } from "@/components/ui/container";

export default function Home() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-sm bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Principle />
        <Treatments />
        <Container className="min-h-[150vh]">
          {["escala", "metodo", "profissional", "contato"].map((id) => (
            <section key={id} id={id} className="py-24">
              <h2 className="font-display text-heading">{id}</h2>
            </section>
          ))}
        </Container>
      </main>
      <Footer />
      <MobileActionBar />
    </>
  );
}

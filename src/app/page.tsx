import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { Doctor } from "@/components/sections/doctor";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Method } from "@/components/sections/method";
import { Principle } from "@/components/sections/principle";
import { Reviews } from "@/components/sections/reviews";
import { ShadeGuide } from "@/components/sections/shade-guide";
import { Treatments } from "@/components/sections/treatments";

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
        <ShadeGuide />
        <Method />
        <Doctor />
        <Reviews />
        <Faq />
        <section id="contato" className="py-24" />
      </main>
      <Footer />
      <MobileActionBar />
    </>
  );
}

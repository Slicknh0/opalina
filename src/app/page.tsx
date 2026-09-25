import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { ToothScene } from "@/components/scene/tooth-scene";
import { Contact } from "@/components/sections/contact";
import { Doctor } from "@/components/sections/doctor";
import { Faq } from "@/components/sections/faq";
import { Method } from "@/components/sections/method";
import { Reviews } from "@/components/sections/reviews";
import { ShadeGuide } from "@/components/sections/shade-guide";
import { Treatments } from "@/components/sections/treatments";
import { clinic } from "@/content/clinic";
import { buildDentistJsonLd, serializeJsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

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
        <ToothScene />
        <Treatments />
        <ShadeGuide />
        <Method />
        <Doctor />
        <Reviews />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <MobileActionBar />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized with "<" escaped
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildDentistJsonLd(clinic, SITE_URL)),
        }}
      />
    </>
  );
}

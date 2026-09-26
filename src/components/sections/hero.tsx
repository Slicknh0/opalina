import { HeroTitle } from "@/components/motion/hero-title";
import { ShaderSlot } from "@/components/shader/shader-slot";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { clinic } from "@/content/clinic";
import { bookingHref } from "@/lib/contact";

export function Hero() {
  const { hero } = clinic;
  return (
    <section
      aria-labelledby="hero-title"
      className="relative pt-28 pb-16 lg:flex lg:min-h-[92svh] lg:items-center lg:pt-32 lg:pb-20"
    >
      <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <HeroTitle
            id="hero-title"
            className="max-w-[15ch] text-balance font-display text-display font-light"
          >
            {hero.title}
          </HeroTitle>
          <p className="mt-8 max-w-[46ch] text-supporting text-foreground/80">
            {hero.lead} {hero.body}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <ButtonLink href={bookingHref(clinic.whatsapp)}>
              Agendar avaliação
            </ButtonLink>
            <ButtonLink
              href="#tratamentos"
              variant="ghost"
              className="self-start sm:self-auto"
            >
              Conhecer os tratamentos
            </ButtonLink>
          </div>
          <p className="mt-12 max-w-[40ch] border-l border-accent/50 pl-4 text-caption text-muted">
            {hero.trust}
          </p>
        </div>

        {/* Enamel window: a tooth-proportioned oval of moving pearl light. */}
        <div className="relative mx-auto aspect-[3/4] w-[min(78vw,22rem)] lg:col-span-5 lg:w-full lg:max-w-[26rem]">
          <div className="absolute inset-0 overflow-hidden rounded-[50%/42%] shadow-porcelain">
            <ShaderSlot variant="hero" />
          </div>
          <div
            aria-hidden
            className="absolute -inset-3 rounded-[50%/42%] border border-foreground/10"
          />
        </div>
      </Container>
    </section>
  );
}

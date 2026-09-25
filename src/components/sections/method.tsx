import { ArchLine } from "@/components/motion/arch-line";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { clinic } from "@/content/clinic";
import { bookingHref } from "@/lib/contact";
import { MethodSteps } from "./method-steps";

export function Method() {
  const { method } = clinic;
  return (
    <section
      id="metodo"
      aria-labelledby="metodo-titulo"
      className="py-24 lg:py-36"
    >
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <h2
              id="metodo-titulo"
              className="text-balance font-display text-heading font-light"
            >
              {method.title}
            </h2>
            <ArchLine
              steps={method.steps.length}
              className="mt-10 max-w-[18rem] lg:mt-16 lg:max-w-sm"
            />
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <MethodSteps steps={method.steps} />
          <div className="mt-16 lg:mt-8">
            <ButtonLink href={bookingHref(clinic.whatsapp)}>
              Começar pela avaliação
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

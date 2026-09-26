import { Container } from "@/components/ui/container";
import { clinic } from "@/content/clinic";
import { bookingHref } from "@/lib/contact";
import { TreatmentIndex } from "./treatment-index";

export function Treatments() {
  return (
    <section
      id="tratamentos"
      aria-labelledby="tratamentos-titulo"
      className="py-24 lg:py-36"
    >
      <Container>
        <div className="mb-14 grid gap-6 lg:mb-20 lg:grid-cols-12 lg:gap-8">
          <h2
            id="tratamentos-titulo"
            className="text-balance font-display text-heading font-light lg:col-span-7"
          >
            Tratamentos pensados para parecer seus.
          </h2>
          <p className="max-w-[42ch] text-supporting text-foreground/80 lg:col-span-4 lg:col-start-9 lg:self-end">
            Cada caso começa pela avaliação. Os tratamentos abaixo podem ser
            combinados em um único plano.
          </p>
        </div>
        <TreatmentIndex
          treatments={clinic.treatments}
          bookingHref={bookingHref(clinic.whatsapp)}
        />
      </Container>
    </section>
  );
}

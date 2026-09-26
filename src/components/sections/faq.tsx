import { Container } from "@/components/ui/container";
import { PlaceholderText } from "@/components/ui/placeholder-text";
import { clinic } from "@/content/clinic";

export function Faq() {
  return (
    <section
      id="perguntas"
      aria-labelledby="perguntas-titulo"
      className="py-24 lg:py-36"
    >
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <h2
          id="perguntas-titulo"
          className="text-balance font-display text-heading font-light lg:col-span-4"
        >
          Perguntas frequentes
        </h2>
        <div className="border-b border-border lg:col-span-7 lg:col-start-6">
          {clinic.faq.map((item) => (
            <details
              key={item.question}
              name="perguntas"
              className="group border-t border-border"
            >
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-6 font-display text-[clamp(1.25rem,1.1rem+0.6vw,1.625rem)] font-light leading-snug [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="relative size-3 shrink-0 before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-current after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-current after:transition-transform after:duration-(--duration-ui) group-open:after:scale-y-0"
                />
              </summary>
              <p className="max-w-[58ch] pb-8 text-supporting text-foreground/80">
                <PlaceholderText value={item.answer} />
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

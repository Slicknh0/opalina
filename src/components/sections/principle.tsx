import { Container } from "@/components/ui/container";
import { LightSweepText } from "@/components/ui/light-sweep-text";
import { clinic } from "@/content/clinic";

export function Principle() {
  const { principle } = clinic;
  return (
    <section
      aria-label="Nosso princípio"
      className="border-t border-border py-24 lg:py-40"
    >
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <LightSweepText
          as="h2"
          text={principle.statement}
          className="text-balance font-display text-heading font-light lg:col-span-8 lg:col-start-2"
        />
        <div className="space-y-5 text-supporting text-foreground/80 lg:col-span-4 lg:col-start-8 lg:mt-6">
          {principle.paragraphs.map((p) => (
            <p key={p} className="max-w-[44ch]">
              {p}
            </p>
          ))}
        </div>
      </Container>
    </section>
  );
}

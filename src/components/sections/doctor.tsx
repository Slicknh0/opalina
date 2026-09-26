import { StaticGlow } from "@/components/shader/static-glow";
import { Container } from "@/components/ui/container";
import { PlaceholderText } from "@/components/ui/placeholder-text";
import { TextureFrame } from "@/components/ui/texture-frame";
import { clinic } from "@/content/clinic";
import { placeholder } from "@/lib/placeholder";

export function Doctor() {
  const { doctor } = clinic;
  return (
    <section
      id="profissional"
      aria-labelledby="profissional-titulo"
      className="border-t border-border py-24 lg:py-36"
    >
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <TextureFrame className="aspect-[4/5] w-full max-w-md lg:col-span-5 lg:max-w-none">
          <StaticGlow />
          <p className="absolute inset-x-0 bottom-6 flex justify-center">
            <PlaceholderText
              value={placeholder("Retrato editorial da profissional")}
            />
          </p>
        </TextureFrame>

        <div className="lg:col-span-6 lg:col-start-7 lg:self-center">
          <h2
            id="profissional-titulo"
            className="text-balance font-display text-heading font-light"
          >
            Quem cuida do seu sorriso.
          </h2>
          <p className="mt-8 font-display text-[1.75rem] font-light leading-tight">
            <PlaceholderText value={doctor.name} />
          </p>
          <p className="mt-2 text-muted">
            <PlaceholderText value={doctor.cro} />
          </p>
          <p className="mt-8 max-w-[48ch] text-supporting text-foreground/80">
            <PlaceholderText value={doctor.bio} />
          </p>
          <blockquote className="mt-10 border-l border-accent/50 pl-6 font-display-italic text-[1.5rem] font-light italic leading-snug">
            <PlaceholderText value={doctor.quote} />
          </blockquote>
        </div>
      </Container>
    </section>
  );
}

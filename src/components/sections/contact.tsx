import { ShaderSlot } from "@/components/shader/shader-slot";
import { Container } from "@/components/ui/container";
import { PlaceholderText } from "@/components/ui/placeholder-text";
import { clinic } from "@/content/clinic";
import { externalHref } from "@/lib/contact";
import { isPlaceholder } from "@/lib/placeholder";
import { BookingForm } from "./booking-form";

export function Contact() {
  return (
    <section id="contato" aria-labelledby="contato-titulo" className="pb-24">
      {/* Closing band: the hero's enamel light returns, wide and quiet. */}
      <div className="relative overflow-hidden border-y border-border">
        <ShaderSlot variant="band" />
        <Container className="relative py-24 lg:py-32">
          <h2
            id="contato-titulo"
            className="max-w-[16ch] text-balance font-display text-display font-light"
          >
            Sua avaliação começa por uma conversa.
          </h2>
        </Container>
      </div>

      <Container className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <p className="mb-10 max-w-[44ch] text-supporting text-foreground/80">
            Conte o que você gostaria de mudar no sorriso. Respondemos pelo
            WhatsApp para combinar o melhor horário.
          </p>
          <BookingForm />
        </div>

        <dl className="grid content-start gap-8 text-[0.9375rem] sm:grid-cols-2 lg:col-span-4 lg:col-start-9 lg:grid-cols-1">
          <div>
            <dt className="text-muted">Endereço</dt>
            <dd className="mt-1">
              <PlaceholderText value={clinic.address} />
              <br />
              {clinic.neighborhood}, {clinic.city} – {clinic.state}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Horário</dt>
            <dd className="mt-1">
              <PlaceholderText value={clinic.hours} />
            </dd>
          </div>
          <div>
            <dt className="text-muted">Telefone e WhatsApp</dt>
            <dd className="mt-1 space-y-1">
              <p>
                <PlaceholderText value={clinic.phone} />
              </p>
              <p>
                <PlaceholderText value={clinic.whatsapp} />
              </p>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Como chegar</dt>
            <dd className="mt-1">
              {isPlaceholder(clinic.mapsUrl) ? (
                <PlaceholderText value={clinic.mapsUrl} />
              ) : (
                externalHref(clinic.mapsUrl) && (
                  <a
                    href={externalHref(clinic.mapsUrl) ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    Abrir no Google Maps
                  </a>
                )
              )}
            </dd>
          </div>
        </dl>
      </Container>
    </section>
  );
}

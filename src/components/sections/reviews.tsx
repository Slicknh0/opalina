import { Container } from "@/components/ui/container";
import { PlaceholderText } from "@/components/ui/placeholder-text";
import { clinic } from "@/content/clinic";
import { externalHref } from "@/lib/contact";
import { isPlaceholder } from "@/lib/placeholder";

/** One real review, set large. No stars or scores: only what the clinic can show. */
export function Reviews() {
  const { review } = clinic;
  return (
    <section
      aria-labelledby="avaliacoes-titulo"
      className="bg-surface py-24 lg:py-32"
    >
      <Container className="max-w-4xl text-center">
        <h2 id="avaliacoes-titulo" className="text-[0.9375rem] text-muted">
          Avaliações de pacientes
        </h2>
        <figure className="mt-10">
          <blockquote className="text-balance font-display-italic text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-light italic leading-[1.2]">
            <PlaceholderText value={review.quote} />
          </blockquote>
          <figcaption className="mt-8 text-[0.9375rem] text-muted">
            <PlaceholderText value={review.author} />
          </figcaption>
        </figure>
        <p className="mt-10 text-[0.9375rem]">
          {isPlaceholder(review.sourceUrl) ? (
            <PlaceholderText value={review.sourceUrl} />
          ) : (
            externalHref(review.sourceUrl) && (
              <a
                href={externalHref(review.sourceUrl) ?? undefined}
                className="underline underline-offset-4"
                rel="noopener noreferrer"
                target="_blank"
              >
                Ver todas as avaliações no Google
              </a>
            )
          )}
        </p>
      </Container>
    </section>
  );
}

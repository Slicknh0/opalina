import type { Treatment } from "@/content/clinic";
import { cn } from "@/lib/cn";

/** A treatment's Agnes render: an illustrative object, never a patient or a result. */
export function TreatmentRender({
  render,
  decorative,
  className,
}: {
  render: Treatment["render"];
  /** Inside an aria-hidden panel the alt text would be noise. */
  decorative?: boolean;
  className?: string;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: next/image optimisation needs sharp, whose build is blocked; sizes are pre-generated
    <img
      src={`${render.src}-1024.webp`}
      srcSet={`${render.src}-640.webp 640w, ${render.src}-1024.webp 1024w`}
      sizes="(min-width: 1024px) 30vw, 40vw"
      width={1024}
      height={1024}
      alt={decorative ? "" : render.alt}
      loading="lazy"
      decoding="async"
      className={cn(
        "h-full w-full object-contain mix-blend-multiply [mask-image:radial-gradient(circle_closest-side,#000_70%,transparent)]",
        className,
      )}
    />
  );
}

import { cn } from "@/lib/cn";

type SceneStillProps = {
  name: "k1" | "cutaway" | "implant";
  alt: string;
  /** The poster: fetched eagerly with high priority (LCP candidate). */
  priority?: boolean;
  className?: string;
};

/** A pre-generated Agnes still, served as responsive WebP. */
export function SceneStill({
  name,
  alt,
  priority,
  className,
}: SceneStillProps) {
  return (
    <img
      src={`/tooth/${name}-1024.webp`}
      srcSet={`/tooth/${name}-640.webp 640w, /tooth/${name}-1024.webp 1024w`}
      sizes="(min-width: 768px) 45vw, 80vw"
      width={1024}
      height={1024}
      alt={alt}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={cn(
        "h-full w-full object-contain mix-blend-multiply",
        className,
      )}
    />
  );
}

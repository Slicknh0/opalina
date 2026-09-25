import { Fragment } from "react";

type HeroTitleProps = { children: string; className?: string; id?: string };

/**
 * The page's one orchestrated moment: words rise into place, line by line.
 * Pure CSS on server-split words, so the title paints on the first frame
 * without waiting for JavaScript. Skipped entirely with reduced motion.
 */
export function HeroTitle({ children, className, id }: HeroTitleProps) {
  return (
    <h1 id={id} className={className}>
      {children.split(" ").map((word, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: words of a static title
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="-mb-[0.1em] inline-block overflow-clip pb-[0.1em] align-top">
            <span
              className="inline-block motion-safe:animate-rise"
              style={{ animationDelay: `${150 + i * 70}ms` }}
            >
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </h1>
  );
}

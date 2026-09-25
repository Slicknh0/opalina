import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Adapted from Cult UI's `texture-card` (https://www.cult-ui.com, MIT):
 * the same nested hairline borders — alternating light and dark — now read
 * as the glazed bevel of a ceramic tile, on the project's low radius.
 */
export function TextureFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-white/70 bg-linear-to-b from-surface to-background p-px shadow-porcelain",
        className,
      )}
    >
      <div className="h-full rounded-[5px] border border-foreground/10">
        <div className="h-full rounded-[4px] border border-white/60">
          <div className="relative h-full overflow-hidden rounded-[3px] border border-foreground/15">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

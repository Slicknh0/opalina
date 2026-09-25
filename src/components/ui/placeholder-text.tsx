import { cn } from "@/lib/cn";
import { isPlaceholder, type Maybe } from "@/lib/placeholder";

type PlaceholderTextProps = {
  value: Maybe<string>;
  className?: string;
};

/**
 * Renders a real value as-is, or a clearly marked slot the clinic must fill.
 * The dashed frame keeps demo placeholders from ever reading as facts.
 */
export function PlaceholderText({ value, className }: PlaceholderTextProps) {
  if (!isPlaceholder(value)) return <span className={className}>{value}</span>;
  return (
    <span
      data-placeholder=""
      className={cn(
        "inline-block rounded-xs border border-dashed border-accent/60 px-1.5 py-px font-mono text-[0.8em] leading-snug text-accent",
        className,
      )}
    >
      [{value.label}]
    </span>
  );
}

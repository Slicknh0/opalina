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
        "rounded-xs border border-dashed border-accent/50 px-1.5 text-accent [box-decoration-break:clone]",
        className,
      )}
    >
      [{value.label}]
    </span>
  );
}

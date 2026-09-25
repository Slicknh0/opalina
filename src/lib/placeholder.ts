/**
 * A value the real clinic must supply. Rendered as a visible placeholder,
 * never as a fact — the demo must not fabricate verifiable claims.
 */
export type Placeholder = {
  readonly kind: "placeholder";
  readonly label: string;
};
export type Maybe<T> = T | Placeholder;

export const placeholder = (label: string): Placeholder => ({
  kind: "placeholder",
  label,
});

export function isPlaceholder(value: unknown): value is Placeholder {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Placeholder).kind === "placeholder"
  );
}

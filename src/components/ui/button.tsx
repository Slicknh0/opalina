import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-6 text-[0.9375rem] font-medium transition-[background-color,border-color,color] duration-(--duration-ui) ease-porcelain disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/85",
  secondary:
    "border border-foreground/25 text-foreground hover:border-foreground/70",
  ghost:
    "px-0 text-foreground underline decoration-foreground/30 underline-offset-[6px] hover:decoration-foreground",
};

export function buttonClasses(
  variant: Variant = "primary",
  className?: string,
) {
  return cn(base, variants[variant], className);
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
};

export function ButtonLink({ variant, className, ...props }: ButtonLinkProps) {
  return <a className={buttonClasses(variant, className)} {...props} />;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({
  variant,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, className)}
      {...props}
    />
  );
}

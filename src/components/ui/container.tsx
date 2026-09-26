import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

/** Page-width wrapper: 4-column gutter on mobile, 12-column grid from lg. */
export function Container({
  children,
  className,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-(--container-page) px-5 sm:px-8 lg:px-12",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

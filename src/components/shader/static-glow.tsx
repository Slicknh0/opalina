import { cn } from "@/lib/cn";

/**
 * Static pearl light: the shader's palette as layered radial gradients.
 * Always rendered underneath the WebGL layer, so the art direction holds
 * without WebGL, with reduced motion, and before the canvas mounts.
 */
export function StaticGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 bg-[radial-gradient(120%_80%_at_30%_20%,#fbfaf7_0%,transparent_55%),radial-gradient(90%_70%_at_75%_80%,#d9e3e9_0%,transparent_60%),radial-gradient(80%_60%_at_60%_40%,#efe9df_0%,transparent_70%),linear-gradient(160deg,#f4f2ed_0%,#e4eaed_100%)]",
        className,
      )}
    />
  );
}

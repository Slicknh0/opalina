import type { ReactNode } from "react";

/**
 * Diagrams of what each treatment does, drawn as porcelain "specimens":
 * teeth are abstract ovals (no tooth icons), the "after" state is the accent.
 * Enamel fills use the shade guide's A1/B1/A3 values.
 */

const ENAMEL = "#e8ddc6";
const ENAMEL_LIGHT = "#eee6d4";
const ENAMEL_DARK = "#d8c39f";
const LINE = "rgb(35 39 45 / 0.28)";
const ACCENT = "#3d6b8a";

function Tooth({
  cx,
  cy,
  rx = 34,
  ry = 52,
  fill = ENAMEL,
  rotate = 0,
}: {
  cx: number;
  cy: number;
  rx?: number;
  ry?: number;
  fill?: string;
  rotate?: number;
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill={fill}
      stroke={LINE}
      strokeWidth={1}
      transform={rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined}
    />
  );
}

const specimens: Record<string, ReactNode> = {
  lentes: (
    <>
      <Tooth cx={150} cy={200} rx={62} ry={96} fill={ENAMEL_DARK} />
      <ellipse
        cx={146}
        cy={200}
        rx={64}
        ry={98}
        fill="rgb(255 255 255 / 0.55)"
        stroke={ACCENT}
        strokeWidth={1.25}
      />
      <path d="M214 150 L250 132" stroke={ACCENT} strokeWidth={1} />
      <circle cx={250} cy={132} r={2.5} fill={ACCENT} />
    </>
  ),
  facetas: (
    <>
      <Tooth cx={156} cy={200} rx={56} ry={90} fill={ENAMEL_DARK} />
      <ellipse
        cx={146}
        cy={200}
        rx={66}
        ry={100}
        fill="rgb(255 255 255 / 0.72)"
        stroke={ACCENT}
        strokeWidth={1.25}
      />
      <ellipse
        cx={130}
        cy={172}
        rx={16}
        ry={34}
        fill="rgb(255 255 255 / 0.6)"
      />
    </>
  ),
  clareamento: (
    <>
      <Tooth cx={84} cy={200} fill={ENAMEL_DARK} />
      <Tooth cx={150} cy={200} fill={ENAMEL} />
      <Tooth cx={216} cy={200} fill={ENAMEL_LIGHT} />
      <path
        d="M60 290 H240"
        stroke={ACCENT}
        strokeWidth={1.25}
        markerEnd="url(#arrow)"
      />
    </>
  ),
  alinhadores: (
    <>
      {[60, 120, 180, 240].map((x) => (
        <ellipse
          key={x}
          cx={x}
          cy={200}
          rx={27}
          ry={46}
          fill="none"
          stroke={ACCENT}
          strokeWidth={1.25}
          strokeDasharray="4 4"
        />
      ))}
      <Tooth cx={62} cy={206} rx={27} ry={46} rotate={-9} />
      <Tooth cx={118} cy={194} rx={27} ry={46} rotate={7} />
      <Tooth cx={184} cy={204} rx={27} ry={46} rotate={-5} />
      <Tooth cx={238} cy={198} rx={27} ry={46} rotate={10} />
    </>
  ),
  gengiva: (
    <>
      {[60, 120, 180, 240].map((x) => (
        <Tooth key={x} cx={x} cy={214} rx={27} ry={50} />
      ))}
      <path
        d="M30 176 Q60 150 90 170 T150 158 T210 176 T270 160"
        fill="none"
        stroke={LINE}
        strokeWidth={1.5}
      />
      <path
        d="M30 168 Q60 146 90 168 T150 168 T210 168 T270 168"
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.25}
        strokeDasharray="4 4"
      />
    </>
  ),
  reabilitacao: (
    <>
      <Tooth cx={60} cy={200} rx={27} ry={46} />
      <Tooth cx={120} cy={200} rx={27} ry={46} fill={ENAMEL_DARK} />
      <ellipse
        cx={180}
        cy={200}
        rx={27}
        ry={46}
        fill="rgb(255 255 255 / 0.6)"
        stroke={ACCENT}
        strokeWidth={1.25}
        strokeDasharray="4 4"
      />
      <Tooth cx={240} cy={200} rx={27} ry={46} />
      <path d="M180 250 V300" stroke={ACCENT} strokeWidth={1.25} />
    </>
  ),
};

export function TreatmentSpecimen({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 300 400"
      className={className}
      role="presentation"
      aria-hidden
      focusable="false"
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10" fill="none" stroke={ACCENT} />
        </marker>
      </defs>
      {specimens[id]}
    </svg>
  );
}

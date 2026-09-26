export type Shade = { code: string; hex: string; note: string };

/**
 * A subset of the shade guide dentists use to choose tooth color.
 * Hex values are illustrative approximations for the web, not clinical references.
 */
export const SHADES: readonly Shade[] = [
  {
    code: "BL1",
    hex: "#F3F0E8",
    note: "Tom de clareamento, muito luminoso. Exige avaliação cuidadosa para não parecer artificial.",
  },
  {
    code: "B1",
    hex: "#EEE6D4",
    note: "Claro e neutro. Costuma harmonizar com peles claras e sorrisos jovens.",
  },
  {
    code: "A1",
    hex: "#E8DDC6",
    note: "Claro, com leve calor. Um dos tons mais escolhidos para resultados naturais.",
  },
  {
    code: "A2",
    hex: "#E1D1B2",
    note: "Natural e quente. Comum em dentes que nunca passaram por clareamento.",
  },
  {
    code: "A3",
    hex: "#D8C39F",
    note: "Mais saturado. Muitas vezes é o ponto de partida antes de um clareamento.",
  },
  {
    code: "A3.5",
    hex: "#CDB48C",
    note: "Saturação alta. Serve de referência para planejar quanto clarear, sem exagero.",
  },
];

export const DEFAULT_SHADE = "A1";

/** WCAG relative luminance of a #rrggbb color. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

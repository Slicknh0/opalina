# Opalina Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Opalina premium dental landing page (portfolio demo, PT-BR) described in the spec, production-ready, responsive, accessible and honest about placeholders.

**Architecture:** Single-page Next.js App Router site. Sections are server components fed by one typed content module (`src/content/clinic.ts`); interactivity lives in small client islands (header, treatment index, shade guide, method/arch, form, shader, reveals). Pure logic (WhatsApp link, booking validation, shade data, placeholder helper) lives in `src/lib` with unit tests.

**Tech Stack:** Next.js 16.3 · React 19.3 · TypeScript · Tailwind CSS 4.3 (CSS-first `@theme`) · motion 13 (`motion/react`) · animejs 4.5 · @shadergradient/react 2.4 + @react-three/fiber 9 + three · Biome · Vitest · Playwright · pnpm.

**Spec:** `docs/superpowers/specs/2026-09-25-opalina-landing-design.md`

## Global Constraints

- Tailwind CSS v4 is the main styling system. Tokens live in `src/app/globals.css` `@theme`. No CSS Modules / CSS-in-JS. No v3 `tailwind.config.js`.
- Copy language: PT-BR. Code identifiers and comments: English.
- Every verifiable real-world fact (reviews, rating, dentist name, CRO, address, phone, WhatsApp, hours, prices, before/after, counts) is a `placeholder()` in `src/content/clinic.ts` and renders with the `Placeholder` component style. Never fabricate.
- Stock images never depict patients, results or the professional.
- Motion owns reveals/hover/layout/nav; Anime.js owns only the SVG arch draw and the hero title choreography. Never both on the same element + property.
- `prefers-reduced-motion`: content visible, arch fully drawn, shader replaced by static fallback.
- Single accent color (`accent`, ice blue) — only focus rings, active states, shade-guide details.
- Radius 2–6px (`rounded-xs`/`rounded-sm`), no pill buttons, no over-rounded cards.
- Commits: conventional messages, **no `Co-Authored-By` trailer** (user rule).
- Breakpoints validated: 320, 360, 390, 430, 768, 1024, 1280, 1440, 1920.

## Review Focus

- Phone typed in any common BR format (`(11) 98765-4321`, `+55 11 98765 4321`, `11987654321`) → accepted and normalized; letters or too few digits → clear inline error. (Task 3 tests.)
- Message with accents, emoji, `&`, `?`, `#`, line breaks → survives into the `wa.me` link intact. (Task 3 tests.)
- Name of only spaces, or message over 500 chars → rejected with a PT-BR error, not silently trimmed to empty. (Task 3 tests.)
- Clinic WhatsApp still a placeholder → submit shows the "not configured" notice, never a fake success. (Task 11 unit + Task 13 e2e.)
- Keyboard-only user and reduced-motion user → treatment index and shade guide operable with arrows/Tab, all content visible without animation, no WebGL required. (Task 13 e2e.)

---

### Task 1: Scaffold project and toolchain

**Files:**
- Create: whole Next.js app in `C:\Users\likcv\Documents\opalina` (docs/ already there)
- Create: `biome.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`

- [ ] **Step 1:** Scaffold into a temp dir (create-next-app refuses non-empty dirs) and move files in:

```bash
cd /c/Users/likcv/Documents
pnpm create next-app@16.3.6 opalina-tmp --ts --tailwind --app --src-dir --biome --use-pnpm --import-alias "@/*" --no-react-compiler --yes
cp -r opalina-tmp/. opalina/ && rm -rf opalina-tmp
```

- [ ] **Step 2:** Confirm versions: `pnpm list next react tailwindcss` → next 16.3.x, react 19.x, tailwindcss 4.x; confirm `src/app/globals.css` starts with `@import "tailwindcss";` and `postcss.config.mjs` uses `@tailwindcss/postcss` (v4 setup — do not add a JS config).
- [ ] **Step 3:** Add deps:

```bash
pnpm add motion animejs @shadergradient/react @react-three/fiber three three-stdlib camera-controls clsx tailwind-merge
pnpm add -D @types/three vitest @vitest/coverage-v8 @playwright/test
pnpm exec playwright install chromium
```

- [ ] **Step 4:** `vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
```

- [ ] **Step 5:** `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3100" },
  webServer: { command: "pnpm build && pnpm start -p 3100", url: "http://localhost:3100", timeout: 240_000, reuseExistingServer: true },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
```

- [ ] **Step 6:** Scripts in `package.json`: `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"e2e": "playwright test"`, `"check": "biome check ."`. Add `test-results/`, `playwright-report/` to `.gitignore`.
- [ ] **Step 7:** Run `pnpm typecheck && pnpm check && pnpm build` → all pass.
- [ ] **Step 8:** Commit `chore: scaffold Next.js 16 + Tailwind v4 toolchain`.

### Task 2: Design tokens, fonts, UI primitives

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Create: `src/lib/cn.ts`, `src/components/ui/button.tsx`, `src/components/ui/eyebrow.tsx`, `src/components/ui/container.tsx`

**Interfaces — Produces:** `cn(...inputs: ClassValue[]): string`; `ButtonLink` props `{ href: string; variant?: "primary" | "secondary" | "ghost"; children; className? } & AnchorHTMLAttributes`; `Button` same variants for `<button>`; `Eyebrow({ children, className? })`; `Container({ children, className?, as? })`. Font CSS variables `--font-display`, `--font-sans`, `--font-mono`.

- [ ] **Step 1:** `src/lib/cn.ts`:

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2:** `globals.css` — replace scaffold content:

```css
@import "tailwindcss";

@theme {
  --color-background: oklch(0.978 0.007 85);
  --color-foreground: oklch(0.255 0.012 255);
  --color-surface: oklch(0.958 0.009 82);
  --color-surface-muted: oklch(0.93 0.012 80);
  --color-muted: oklch(0.47 0.012 255);
  --color-primary: oklch(0.255 0.012 255);
  --color-primary-foreground: oklch(0.978 0.007 85);
  --color-secondary: oklch(0.93 0.012 80);
  --color-accent: oklch(0.52 0.085 232);
  --color-accent-soft: oklch(0.9 0.03 225);
  --color-border: oklch(0.88 0.012 80);
  --color-success: oklch(0.5 0.07 160);
  --color-error: oklch(0.52 0.13 25);

  --font-display: var(--font-newsreader), ui-serif, Georgia, serif;
  --font-sans: var(--font-hanken), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-plex-mono), ui-monospace, monospace;

  --text-display: clamp(2.75rem, 1.6rem + 5.2vw, 6.5rem);
  --text-display--line-height: 0.98;
  --text-display--letter-spacing: -0.025em;
  --text-heading: clamp(2rem, 1.4rem + 2.6vw, 3.75rem);
  --text-heading--line-height: 1.04;
  --text-heading--letter-spacing: -0.02em;
  --text-supporting: 1.1875rem;
  --text-supporting--line-height: 1.55;
  --text-eyebrow: 0.75rem;
  --text-eyebrow--line-height: 1.2;
  --text-eyebrow--letter-spacing: 0.14em;

  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;

  --shadow-porcelain: 0 1px 0 oklch(1 0 0 / 0.7) inset, 0 24px 48px -32px oklch(0.25 0.02 250 / 0.28);

  --ease-porcelain: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-soft: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-micro: 160ms;
  --duration-ui: 280ms;
  --duration-reveal: 600ms;
  --duration-hero: 1000ms;

  --container-page: 80rem;
}

@layer base {
  html { scroll-behavior: smooth; scroll-padding-top: 5rem; }
  body { @apply bg-background font-sans text-foreground antialiased; }
  ::selection { background: var(--color-accent-soft); }
  :focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

Note: Tailwind v4 `duration-*` / `ease-*` utilities read `--ease-*`; durations are referenced as `duration-(--duration-ui)`. Motion (JS) reads the same values from `src/lib/motion.ts` (Task 6), which must match these numbers.

- [ ] **Step 3:** `layout.tsx`: load `Newsreader` (variable, `style: ["normal","italic"]`, `axes: ["opsz"]`), `Hanken_Grotesk`, `IBM_Plex_Mono` (weights 400, 500) from `next/font/google`, `subsets: ["latin"]`, `display: "swap"`, variables `--font-newsreader`, `--font-hanken`, `--font-plex-mono`; `<html lang="pt-BR">`.
- [ ] **Step 4:** Button/ButtonLink: `inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-6 text-sm font-medium tracking-wide transition-colors duration-(--duration-ui) ease-porcelain`; primary `bg-primary text-primary-foreground hover:bg-primary/88`; secondary `border border-foreground/20 hover:border-foreground/60`; ghost `underline-offset-4 hover:underline`.
- [ ] **Step 5:** Temporary token preview in `page.tsx` (h1 in `font-display text-display`, buttons). `pnpm build` passes; screenshot at 390 and 1440 with agent-browser; check fonts render with accents ("Estética, avaliação, é").
- [ ] **Step 6:** Commit `feat: add design tokens, fonts and UI primitives`.

### Task 3: Content model and pure logic (TDD)

**Files:**
- Create: `src/lib/placeholder.ts`, `src/lib/whatsapp.ts`, `src/lib/booking.ts`, `src/lib/shades.ts`, `src/content/clinic.ts`
- Test: `src/lib/placeholder.test.ts`, `src/lib/whatsapp.test.ts`, `src/lib/booking.test.ts`, `src/lib/shades.test.ts`

**Interfaces — Produces:**
- `type Placeholder = { readonly kind: "placeholder"; readonly label: string }`; `placeholder(label: string): Placeholder`; `isPlaceholder(v: unknown): v is Placeholder`; `type Maybe<T> = T | Placeholder`.
- `normalizeBrPhone(input: string): string | null` → E.164 digits `55DDXXXXXXXXX` or null; `buildWhatsAppLink(phoneDigits: string, message: string): string`.
- `type BookingInput = { name: string; phone: string; treatment: string; message: string }`; `validateBooking(input: BookingInput, treatmentIds: readonly string[]): { ok: true; data: BookingInput } | { ok: false; errors: Partial<Record<keyof BookingInput, string>> }`; `composeBookingMessage(data: BookingInput, treatmentLabel: string): string`; `MESSAGE_MAX = 500`.
- `type Shade = { code: string; hex: string; note: string }`; `SHADES: readonly Shade[]`; `DEFAULT_SHADE: string`; `relativeLuminance(hex: string): number`.
- `clinic` object (see Step 9).

- [ ] **Step 1: Failing tests** — `placeholder.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isPlaceholder, placeholder } from "./placeholder";

describe("placeholder", () => {
  it("marks a value as placeholder with its label", () => {
    const p = placeholder("Telefone da clínica");
    expect(isPlaceholder(p)).toBe(true);
    expect(p.label).toBe("Telefone da clínica");
  });
  it("does not flag real values", () => {
    expect(isPlaceholder("Jardins")).toBe(false);
    expect(isPlaceholder(null)).toBe(false);
    expect(isPlaceholder({ label: "x" })).toBe(false);
  });
});
```

`whatsapp.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildWhatsAppLink, normalizeBrPhone } from "./whatsapp";

describe("normalizeBrPhone", () => {
  it.each([
    ["(11) 98765-4321", "5511987654321"],
    ["+55 11 98765 4321", "5511987654321"],
    ["11987654321", "5511987654321"],
    ["11 3456-7890", "551134567890"],
    ["5511987654321", "5511987654321"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeBrPhone(input)).toBe(expected);
  });
  it.each(["", "abc", "12345", "(11) 9876", "+1 415 555 0100 99"])("rejects %s", (input) => {
    expect(normalizeBrPhone(input)).toBeNull();
  });
});

describe("buildWhatsAppLink", () => {
  it("encodes accents, emoji, reserved chars and newlines", () => {
    const msg = "Olá! Avaliação & lentes? #1\nObrigada 😊";
    const url = new URL(buildWhatsAppLink("5511987654321", msg));
    expect(url.origin + url.pathname).toBe("https://wa.me/5511987654321");
    expect(url.searchParams.get("text")).toBe(msg);
  });
  it("throws on non-normalized numbers", () => {
    expect(() => buildWhatsAppLink("(11) 98765-4321", "x")).toThrow();
  });
});
```

`booking.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { composeBookingMessage, MESSAGE_MAX, validateBooking } from "./booking";

const ids = ["lentes", "clareamento", "avaliacao"] as const;
const valid = { name: "Marina Alves", phone: "(11) 98765-4321", treatment: "lentes", message: "" };

describe("validateBooking", () => {
  it("accepts a complete form and trims fields", () => {
    const r = validateBooking({ ...valid, name: "  Marina Alves  ", message: "  oi " }, ids);
    expect(r).toEqual({ ok: true, data: { ...valid, message: "oi" } });
  });
  it("rejects whitespace-only name", () => {
    const r = validateBooking({ ...valid, name: "   " }, ids);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.name).toMatch(/nome/i);
  });
  it("rejects invalid phone", () => {
    const r = validateBooking({ ...valid, phone: "1234" }, ids);
    expect(r.ok === false && r.errors.phone).toMatch(/WhatsApp/);
  });
  it("rejects unknown treatment", () => {
    const r = validateBooking({ ...valid, treatment: "botox" }, ids);
    expect(r.ok === false && r.errors.treatment).toBeTruthy();
  });
  it("rejects messages over the limit", () => {
    const r = validateBooking({ ...valid, message: "a".repeat(MESSAGE_MAX + 1) }, ids);
    expect(r.ok === false && r.errors.message).toMatch(String(MESSAGE_MAX));
  });
});

describe("composeBookingMessage", () => {
  it("includes name, treatment and optional message", () => {
    const text = composeBookingMessage({ ...valid, message: "Prefiro manhãs" }, "Lentes de contato dental");
    expect(text).toContain("Marina Alves");
    expect(text).toContain("Lentes de contato dental");
    expect(text).toContain("Prefiro manhãs");
  });
  it("omits the message line when empty", () => {
    expect(composeBookingMessage(valid, "Lentes")).not.toContain("Observação");
  });
});
```

`shades.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_SHADE, relativeLuminance, SHADES } from "./shades";

describe("SHADES", () => {
  it("has unique codes", () => {
    expect(new Set(SHADES.map((s) => s.code)).size).toBe(SHADES.length);
  });
  it("is ordered from lightest to darkest", () => {
    const l = SHADES.map((s) => relativeLuminance(s.hex));
    for (let i = 1; i < l.length; i++) expect(l[i]).toBeLessThan(l[i - 1]);
  });
  it("includes the default shade", () => {
    expect(SHADES.some((s) => s.code === DEFAULT_SHADE)).toBe(true);
  });
  it("computes luminance of white and black", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1);
    expect(relativeLuminance("#000000")).toBeCloseTo(0);
  });
});
```

- [ ] **Step 2:** `pnpm test` → FAIL (modules missing).
- [ ] **Step 3:** `placeholder.ts`:

```ts
export type Placeholder = { readonly kind: "placeholder"; readonly label: string };
export type Maybe<T> = T | Placeholder;

export const placeholder = (label: string): Placeholder => ({ kind: "placeholder", label });

export function isPlaceholder(value: unknown): value is Placeholder {
  return typeof value === "object" && value !== null && (value as Placeholder).kind === "placeholder";
}
```

- [ ] **Step 4:** `whatsapp.ts`:

```ts
/** Normalizes a Brazilian phone (with DDD) to E.164 digits without "+", or null. */
export function normalizeBrPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) digits = digits.slice(2);
  if (digits.length !== 10 && digits.length !== 11) return null;
  if (digits.length === 11 && digits[2] !== "9") return null;
  return `55${digits}`;
}

export function buildWhatsAppLink(phoneDigits: string, message: string): string {
  if (!/^55\d{10,11}$/.test(phoneDigits)) throw new Error("buildWhatsAppLink expects normalized BR digits");
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 5:** `booking.ts`:

```ts
import { normalizeBrPhone } from "./whatsapp";

export const MESSAGE_MAX = 500;
export type BookingInput = { name: string; phone: string; treatment: string; message: string };
export type BookingErrors = Partial<Record<keyof BookingInput, string>>;
export type BookingResult = { ok: true; data: BookingInput } | { ok: false; errors: BookingErrors };

export function validateBooking(input: BookingInput, treatmentIds: readonly string[]): BookingResult {
  const data: BookingInput = {
    name: input.name.trim().replace(/\s+/g, " "),
    phone: input.phone.trim(),
    treatment: input.treatment,
    message: input.message.trim(),
  };
  const errors: BookingErrors = {};
  if (data.name.length < 2 || data.name.length > 80) errors.name = "Informe seu nome completo.";
  if (!normalizeBrPhone(data.phone)) errors.phone = "Informe um WhatsApp válido com DDD.";
  if (!treatmentIds.includes(data.treatment)) errors.treatment = "Escolha uma opção.";
  if (data.message.length > MESSAGE_MAX) errors.message = `Use no máximo ${MESSAGE_MAX} caracteres.`;
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

export function composeBookingMessage(data: BookingInput, treatmentLabel: string): string {
  const lines = [
    "Olá! Gostaria de agendar uma avaliação na Opalina.",
    `Nome: ${data.name}`,
    `Interesse: ${treatmentLabel}`,
  ];
  if (data.message) lines.push(`Observação: ${data.message}`);
  return lines.join("\n");
}
```

- [ ] **Step 6:** `shades.ts` (colors illustrative, labeled so in UI):

```ts
export type Shade = { code: string; hex: string; note: string };

export const SHADES: readonly Shade[] = [
  { code: "BL1", hex: "#F3F0E8", note: "Tom de clareamento. Muito luminoso; pede avaliação cuidadosa para não parecer artificial." },
  { code: "B1", hex: "#EEE6D4", note: "Claro e neutro. Costuma harmonizar com peles claras e sorrisos jovens." },
  { code: "A1", hex: "#E8DDC6", note: "Claro com leve calor. Um dos tons mais escolhidos em resultados naturais." },
  { code: "A2", hex: "#E1D1B2", note: "Natural e quente. Comum em dentes sem clareamento." },
  { code: "A3", hex: "#D8C39F", note: "Mais saturado. Frequentemente o ponto de partida antes de um clareamento." },
  { code: "A3.5", hex: "#CDB48C", note: "Saturação alta. Referência para planejar quanto clarear, sem exagero." },
];
export const DEFAULT_SHADE = "A1";

export function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

- [ ] **Step 7:** `pnpm test` → all PASS.
- [ ] **Step 8:** `src/content/clinic.ts` — single typed source of truth. Shape:

```ts
import { placeholder, type Maybe } from "@/lib/placeholder";

export type Treatment = { id: string; index: string; name: string; summary: string; indication: string; image: { src: string; alt: string } | null };

export const clinic = {
  name: "Opalina",
  descriptor: "Estúdio de Odontologia Estética",
  neighborhood: "Jardins",
  city: "São Paulo",
  state: "SP",
  address: placeholder("Endereço completo") as Maybe<string>,
  phone: placeholder("Telefone") as Maybe<string>,
  whatsapp: placeholder("WhatsApp") as Maybe<string>, // E.164 digits when real
  hours: placeholder("Horário de atendimento") as Maybe<string>,
  mapsUrl: placeholder("Link do Google Maps") as Maybe<string>,
  instagram: placeholder("Instagram") as Maybe<string>,
  doctor: { name: placeholder("Nome da profissional") as Maybe<string>, cro: placeholder("CRO-SP") as Maybe<string>, bio: placeholder("Biografia real da profissional") as Maybe<string>, quote: placeholder("Frase da profissional sobre seu método") as Maybe<string> },
  responsible: { name: placeholder("Responsável técnico") as Maybe<string>, cro: placeholder("CRO-SP do responsável técnico") as Maybe<string> },
  review: { quote: placeholder("Avaliação real do Google, com autorização") as Maybe<string>, author: placeholder("Nome do paciente") as Maybe<string>, sourceUrl: placeholder("Link do perfil no Google") as Maybe<string> },
  treatments: [/* 01–06 per spec: lentes, facetas, clareamento, alinhadores, gengivoplastia, reabilitacao */] satisfies Treatment[],
  bookingOptions: [/* treatments + { id: "avaliacao", label: "Ainda não sei — quero uma avaliação" } */],
  faq: [/* 6 cautious Q&As: desgaste nas lentes, durabilidade, sensibilidade no clareamento, dor, valores ("definidos após avaliação"), tempo de tratamento */],
} as const;
```

Write the full copy inline (PT-BR, human, no absolute clinical promises). Treatment copy uses "pode", "em muitos casos", "após avaliação".

- [ ] **Step 9:** Add test `src/content/clinic.test.ts`: treatment ids unique; every `bookingOptions` id exists in treatments or is `"avaliacao"`; FAQ has ≥5 entries; no string in `clinic` contains digit patterns that look like fabricated stats (`/\d+\s*(anos|pacientes|sorrisos|%)/i`) — guard against fabrication creeping in.
- [ ] **Step 10:** `pnpm test && pnpm typecheck` → PASS. Commit `feat: add clinic content model and booking/WhatsApp logic`.

### Task 4: Layout shell — Header, MobileNav, MobileActionBar, Footer, Placeholder

**Files:**
- Create: `src/components/ui/placeholder-text.tsx`, `src/components/layout/header.tsx`, `src/components/layout/mobile-nav.tsx`, `src/components/layout/mobile-action-bar.tsx`, `src/components/layout/footer.tsx`
- Modify: `src/app/page.tsx`, `src/app/layout.tsx` (skip link)

**Interfaces — Produces:** `PlaceholderText({ value: Maybe<string>, className? })` renders the real string or `<span data-placeholder>` styled `font-mono text-[0.8em] border border-dashed border-accent/50 px-1.5 text-accent` with text `[${label}]`. `NAV_ITEMS: { href: string; label: string }[]` exported from `header.tsx`. `bookingHref(): string` in `src/lib/contact.ts` — returns WhatsApp link if `clinic.whatsapp` is real, else `"#contato"`.

- [ ] **Step 1:** Header (client): wordmark "Opalina" `font-display` + mono descriptor on ≥lg; nav anchors (Tratamentos `#tratamentos`, Escala de cor `#escala`, Método `#metodo`, Estúdio `#profissional`, Contato `#contato`); CTA ButtonLink "Agendar avaliação" → `bookingHref()`. On scroll >24px (`useScroll` + `useMotionValueEvent` from motion/react) switches to compact: backdrop `bg-background/80 backdrop-blur-md border-b border-border`.
- [ ] **Step 2:** MobileNav (<lg): button with `aria-expanded`, `aria-controls`; full-height sheet (Motion `AnimatePresence`, opacity + y), links close the sheet, Escape closes, focus returns to trigger, body scroll locked while open.
- [ ] **Step 3:** MobileActionBar (<md): fixed bottom, two actions "WhatsApp" / "Ligar" using `bookingHref()` and `tel:` when phone real (else `#contato`); `pb-[env(safe-area-inset-bottom)]`; appears after hero leaves viewport.
- [ ] **Step 4:** Footer: wordmark, address/hours/contacts via PlaceholderText, "Responsável técnico: {name} — {cro}" line, LGPD/privacy sentence, demo disclaimer: "Demonstração de portfólio. Opalina é uma clínica fictícia; dados de contato, profissional e avaliações são espaços reservados."
- [ ] **Step 5:** Skip link "Pular para o conteúdo" → `#conteudo` in layout.
- [ ] **Step 6:** `pnpm typecheck && pnpm check && pnpm build`; screenshot 390 (menu open/closed) and 1440. Commit `feat: add header, mobile navigation and footer`.

### Task 5: Hero, shader and title choreography

**Files:**
- Create: `src/components/shader/ambient-shader.tsx`, `src/components/shader/static-glow.tsx`, `src/components/shader/shader-slot.tsx`, `src/components/motion/hero-title.tsx`, `src/components/sections/hero.tsx`, `src/hooks/use-webgl.ts`
- Modify: `src/app/page.tsx`

**Interfaces — Produces:** `ShaderSlot({ variant: "hero" | "band", className? })` — renders `StaticGlow` always (base layer) and lazily mounts `AmbientShader` above it when WebGL available, not reduced motion, and in view. `useWebGL(): boolean | null`.

- [ ] **Step 1:** `static-glow.tsx`: absolutely positioned div with layered radial gradients in the pearl palette (`#F4EFE6`, `#E7ECEE`, `#D8E3EA`) — pure CSS via Tailwind arbitrary `bg-[radial-gradient(...)]` in one place only.
- [ ] **Step 2:** `ambient-shader.tsx` ("use client"): 

```tsx
import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";

export default function AmbientShader({ variant }: { variant: "hero" | "band" }) {
  return (
    <ShaderGradientCanvas pixelDensity={variant === "hero" ? 1 : 0.8} fov={45} pointerEvents="none" lazyLoad style={{ position: "absolute", inset: 0 }}>
      <ShaderGradient control="props" type="waterPlane" animate="on" uSpeed={0.08} uStrength={1.4} uDensity={1.2} uFrequency={3.2}
        color1="#F4EFE6" color2="#DCE6EC" color3="#FBFAF7" brightness={1.15} grain="on" lightType="3d"
        cDistance={3.4} cPolarAngle={90} cAzimuthAngle={180} rotationX={0} rotationY={10} rotationZ={50} />
    </ShaderGradientCanvas>
  );
}
```

Verify every prop name against installed typings (`node_modules/@shadergradient/react/dist/*.d.ts`) before use; drop any not present.
- [ ] **Step 3:** `shader-slot.tsx`: `dynamic(() => import("./ambient-shader"), { ssr: false })`; gate with `useReducedMotion()` (motion/react), `useWebGL()`, and `useInView` (motion/react, `margin: "200px"`) — unmount when out of view to pause GPU work. Shader fades in over StaticGlow with Motion opacity (only element Motion touches here).
- [ ] **Step 4:** `hero-title.tsx` ("use client"): renders the `<h1>` text server-visible; on mount (not reduced motion) runs Anime.js `splitText(el, { words: { wrap: "clip" } })` + `animate(words, { y: ["110%", "0%"], duration: 1000, delay: stagger(70), ease: "out(4)" })`; reverts split on unmount (`split.revert()`). Text must be readable if JS fails (no initial hidden CSS).
- [ ] **Step 5:** `hero.tsx`: `min-h-[92svh]` grid; left 7 cols: Eyebrow "Estúdio de odontologia estética · Jardins, São Paulo", HeroTitle "Estética dental com a naturalidade da luz.", supporting copy, primary CTA "Agendar avaliação" + secondary "Conhecer tratamentos" (`#tratamentos`), trust line "Cada sorriso planejado individualmente, do estudo de cor ao ensaio digital." Right 5 cols: tall oval-masked image (`rounded-[50%/42%]` — the one sanctioned arch shape) over ShaderSlot; on mobile image below text, shorter.
- [ ] **Step 6:** Build; screenshot 390/768/1440; check LCP element is the h1 (not the canvas); throttle-check no CLS. Commit `feat: add hero with ambient shader and title choreography`.

### Task 6: Motion system, Reveal and Principle section (Cult UI)

**Files:**
- Create: `src/lib/motion.ts`, `src/components/motion/reveal.tsx`, `src/components/ui/text-animate.tsx` (adapted from Cult UI), `src/components/sections/principle.tsx`

**Interfaces — Produces:** `EASE_PORCELAIN = [0.22, 1, 0.36, 1] as const`, `DURATION = { micro: 0.16, ui: 0.28, reveal: 0.6, hero: 1 }`; `Reveal({ children, delay?, as?, className? })` — whileInView opacity 0→1 + y 16→0 once, `viewport={{ once: true, margin: "-10% 0px" }}`; reduced motion renders children without motion. 

- [ ] **Step 1:** Fetch Cult UI `text-animate.tsx` source (already reviewed: motion/react, `useInView`, variants). Port only the `calmInUp` variant, rename to `TextReveal`, use tokens from `lib/motion.ts`, keep accessible: full text in `aria-label` on wrapper and per-word spans `aria-hidden`. Credit Cult UI in a file header comment.
- [ ] **Step 2:** Principle: large `font-display text-heading` statement "Naturalidade antes de brancura." + two short paragraphs on proportion, texture, translucency — offset grid (cols 2–9 / 8–12).
- [ ] **Step 3:** Build + screenshot; verify reduced-motion (agent-browser with `--reduced-motion` emulation or Playwright `reducedMotion: "reduce"`) shows static text. Commit `feat: add motion system and principle section`.

### Task 7: Imagery and Treatments index (Skiper UI evaluation)

**Files:**
- Create: `public/images/*.avif|jpg`, `docs/image-credits.md`, `src/components/sections/treatments.tsx`, `src/components/sections/treatment-index.tsx`

- [ ] **Step 1: Imagery.** Search Unsplash (`https://unsplash.com/napi/search/photos?query=...`) for: porcelain texture, ceramic light, glass reflection soft, white ceramic minimal, natural light interior minimal. Pick 6–7 with no people/teeth; download `w=1600` jpg; record photographer + URL in `docs/image-credits.md`. If the endpoint is blocked, fall back to shader/texture surfaces (spec §8) and record it.
- [ ] **Step 2: Skiper UI.** Fetch `https://skiper-ui.com/r/<name>.json` for free items (known 200: `skiper40`, `skiper31`); inspect source; adopt one only if it fits the treatment reveal or a text effect, porting `framer-motion` → `motion/react`. Record decision (used / rejected + reason) in the plan's execution notes and final report.
- [ ] **Step 3:** `treatment-index.tsx` (client): list of 6 rows (`01`–`06` mono index, `font-display` name, summary). Desktop (≥lg): hovering or focusing a row sets active id; a sticky oval-masked image panel crossfades (Motion `AnimatePresence`, opacity + scale 1.04→1) to that treatment's image; rows are `<button aria-expanded>` controlling detail panel (indication + "Agendar avaliação" link). Mobile: same buttons as disclosures, image inline in the open panel. Arrow Up/Down move focus between rows.
- [ ] **Step 4:** Build, screenshot 390/1024/1440, keyboard-walk the list. Commit `feat: add editorial treatment index`.

### Task 8: Shade guide (visual signature)

**Files:**
- Create: `src/components/sections/shade-guide.tsx`, `src/components/sections/shade-arch.tsx`

- [ ] **Step 1:** Radio group (`role="radiogroup"`, each shade a `role="radio"` button with `aria-checked`, roving tabindex, Arrow Left/Right/Up/Down) — tabs styled as physical shade tabs (tall narrow porcelain chips with the mono code).
- [ ] **Step 2:** `shade-arch.tsx`: SVG of 8 elongated ovals along an arch curve (abstract, not a tooth icon), fill = selected shade hex, animated with Motion `animate={{ fill }}` at `DURATION.ui`.
- [ ] **Step 3:** Copy: heading "Mais branco nem sempre é mais bonito."; paragraph on choosing shade with skin, eyes, age and gum tone; live region (`aria-live="polite"`) with the selected shade note; caption "Cores aproximadas, apenas ilustrativas. A cor ideal é definida em consulta."
- [ ] **Step 4:** Build, screenshots, keyboard check. Commit `feat: add interactive shade guide`.

### Task 9: Method story and arch line (Anime.js)

**Files:**
- Create: `src/components/sections/method.tsx`, `src/components/motion/arch-line.tsx`

- [ ] **Step 1:** `arch-line.tsx` ("use client"): SVG path (smooth arch) `stroke-accent/60`; on mount (not reduced motion) `animate(svg.createDrawable(path), { draw: ["0 0", "0 1"], ease: "linear", autoplay: onScroll({ target: container, enter: "bottom top", leave: "top bottom", sync: true }) })`; cleanup `revert()`. Reduced motion: path drawn fully (no animation created). Verify `onScroll` threshold syntax against docs (`scrollobserver-thresholds`) before writing.
- [ ] **Step 2:** `method.tsx`: two columns on ≥lg — sticky left (heading "Um método, não um procedimento." + ArchLine), right 4 steps (`01 Escuta`, `02 Planejamento digital e ensaio`, `03 Prova`, `04 Execução e acompanhamento`) each in Reveal; mobile single column with the arch as a thin header ornament. Closing CTA after steps.
- [ ] **Step 3:** Build, scroll-through screenshots desktop/mobile; confirm no jank (Chrome performance trace or visual). Commit `feat: add method section with scroll-drawn arch`.

### Task 10: Doctor, Reviews, FAQ

**Files:**
- Create: `src/components/sections/doctor.tsx`, `src/components/sections/reviews.tsx`, `src/components/sections/faq.tsx`, `src/components/ui/texture-frame.tsx` (adapted Cult UI texture card/surface)

- [ ] **Step 1:** Doctor: editorial portrait frame = TextureFrame (porcelain texture + mono label "Retrato editorial da profissional") — no stock person; name/CRO/bio/quote via PlaceholderText.
- [ ] **Step 2:** Reviews: one large editorial quote slot (`font-display italic`) rendering `clinic.review` placeholders + link slot "Ver avaliações no Google". No stars.
- [ ] **Step 3:** FAQ: native `<details>/<summary>`, custom marker, Motion not required; `name="faq"` for exclusive open where supported.
- [ ] **Step 4:** Build, screenshots. Commit `feat: add doctor, reviews and FAQ sections`.

### Task 11: Contact section and booking form

**Files:**
- Create: `src/components/sections/contact.tsx`, `src/components/sections/booking-form.tsx`, `src/lib/contact.ts` (if not created in Task 4)
- Test: `src/lib/contact.test.ts`

**Interfaces — Consumes:** `validateBooking`, `composeBookingMessage`, `buildWhatsAppLink`, `normalizeBrPhone`, `clinic.whatsapp`, `isPlaceholder`.
**Produces:** `resolveBookingTarget(whatsapp: Maybe<string>, message: string): { kind: "whatsapp"; url: string } | { kind: "not-configured" }`.

- [ ] **Step 1: Failing test** `contact.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { placeholder } from "./placeholder";
import { resolveBookingTarget } from "./contact";

describe("resolveBookingTarget", () => {
  it("is not-configured while WhatsApp is a placeholder", () => {
    expect(resolveBookingTarget(placeholder("WhatsApp"), "oi")).toEqual({ kind: "not-configured" });
  });
  it("builds a wa.me link for a real number", () => {
    const t = resolveBookingTarget("5511987654321", "oi");
    expect(t).toEqual({ kind: "whatsapp", url: "https://wa.me/5511987654321?text=oi" });
  });
});
```

- [ ] **Step 2:** Run → FAIL. Implement in `contact.ts`:

```ts
import { isPlaceholder, type Maybe } from "./placeholder";
import { buildWhatsAppLink } from "./whatsapp";

export type BookingTarget = { kind: "whatsapp"; url: string } | { kind: "not-configured" };

export function resolveBookingTarget(whatsapp: Maybe<string>, message: string): BookingTarget {
  if (isPlaceholder(whatsapp)) return { kind: "not-configured" };
  return { kind: "whatsapp", url: buildWhatsAppLink(whatsapp, message) };
}
```

Run → PASS.
- [ ] **Step 3:** `booking-form.tsx` (client): fields Nome (`autocomplete="name"`), WhatsApp (`type="tel" inputmode="tel" autocomplete="tel"`), Tratamento (`<select>`), Mensagem (`<textarea maxlength=500>` + counter). `noValidate`; on submit run `validateBooking`; errors rendered under fields with `aria-invalid` + `aria-describedby`, focus first invalid field. Valid → `status="loading"` briefly, then `resolveBookingTarget`: whatsapp → `window.open(url, "_blank", "noopener")`, status success "Abrimos o WhatsApp com sua mensagem."; not-configured → status notice "Demonstração: configure o número de WhatsApp da clínica para ativar o envio." Status region `role="status"`. LGPD note: "Usamos seus dados apenas para retornar seu contato. Não envie informações de saúde por aqui."
- [ ] **Step 4:** `contact.tsx`: closing band with ShaderSlot `variant="band"`, heading "Sua avaliação começa por uma conversa.", form + details column (address, hours, maps link, WhatsApp, phone via PlaceholderText).
- [ ] **Step 5:** Build, screenshots, manual form run (invalid → errors; valid → not-configured notice). Commit `feat: add contact section and WhatsApp booking form`.

### Task 12: SEO, metadata and security headers

**Files:**
- Modify: `src/app/layout.tsx`, `next.config.ts`
- Create: `src/app/opengraph-image.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/lib/jsonld.ts`
- Test: `src/lib/jsonld.test.ts`

**Produces:** `buildDentistJsonLd(c: typeof clinic): Record<string, unknown>` — includes only non-placeholder fields.

- [ ] **Step 1: Failing test:** JSON-LD has `@type: "Dentist"`, `name: "Opalina"`, `address.addressLocality: "São Paulo"`, and no key whose value is a placeholder (`telephone` absent while placeholder). Run → FAIL; implement; → PASS.
- [ ] **Step 2:** Metadata: title "Opalina · Odontologia estética nos Jardins, São Paulo", description, `metadataBase` from `NEXT_PUBLIC_SITE_URL` (default `http://localhost:3000`), OpenGraph, canonical `/`. `robots.ts` disallows all (demo — avoid indexing a fictional clinic) — document in README.
- [ ] **Step 3:** `opengraph-image.tsx` with `next/og` ImageResponse: ivory background, wordmark, tagline.
- [ ] **Step 4:** Security headers in `next.config.ts` `headers()`: `Content-Security-Policy` (`default-src 'self'; script-src 'self' 'unsafe-inline'` — required by Next inline bootstrap without nonces; `style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Strict-Transport-Security`. Dev mode needs `'unsafe-eval'` — apply only when `NODE_ENV === "development"`.
- [ ] **Step 5:** `pnpm build && pnpm start`, load page, check console for CSP violations (shader must still render). Commit `feat: add SEO metadata, JSON-LD and security headers`.

### Task 13: End-to-end tests

**Files:**
- Create: `tests/e2e/landing.spec.ts`

- [ ] **Step 1:** Tests (both projects):
  - page has exactly one `h1`, title contains "Opalina";
  - each nav anchor target exists (`#tratamentos`, `#escala`, `#metodo`, `#profissional`, `#contato`);
  - treatment index: focus first row, ArrowDown moves focus, Enter expands (`aria-expanded="true"`);
  - shade guide: ArrowRight changes `aria-checked` and live region text;
  - form: submit empty → 3 errors visible and focus on Nome; fill valid (`(11) 98765-4321`) → "Demonstração: configure" notice visible;
  - reduced motion (`test.use({ reducedMotion: "reduce" })`): hero h1 text visible immediately, no `canvas` element present, static glow present;
  - footer contains demo disclaimer; every `[data-placeholder]` is visible text (count > 0).
- [ ] **Step 2:** `pnpm e2e` → all PASS. Commit `test: add end-to-end coverage for landing interactions`.

### Task 14: Visual QA and refinement

- [ ] **Step 1:** Load skills `frontend-design`, `impeccable`, `make-interfaces-feel-better`, `web-design-guidelines`; apply their review to screenshots at 320, 360, 390, 430, 768, 1024, 1280, 1440, 1920 (agent-browser `set viewport` + full-page screenshot).
- [ ] **Step 2:** Run the master prompt's anti-generic check (§43), dental specificity test (§44) and quality gates (§45–48); fix every finding.
- [ ] **Step 3:** Contrast audit of all token pairs (text on background/surface, muted, accent focus ring ≥3:1).
- [ ] **Step 4:** Performance: `pnpm build` output sizes; Lighthouse (`npx lighthouse http://localhost:3100 --preset=desktop` and mobile) — record scores; fix obvious regressions (image sizes, shader bundle via dynamic import).
- [ ] **Step 5:** Re-run `pnpm test && pnpm e2e && pnpm typecheck && pnpm check && pnpm build`. Commit `style: refine visual details after QA`.

### Task 15: Security pass, README, finish

- [ ] **Step 1:** `pnpm audit --prod`; gitleaks (`gitleaks detect` if installed, else `git log -p | grep -iE "key|secret|token"` review); load `security-review` on the full diff; claude-red `web` checks relevant to a static page (headers, CSP, clickjacking, open redirect via `wa.me` builder, XSS through content/JSON-LD — ensure JSON-LD is serialized with `<` escaped).
- [ ] **Step 2:** Fix findings, re-run gates.
- [ ] **Step 3:** README (PT-BR): what it is (demo), stack, how to run, how to turn it into a real clinic (edit `src/content/clinic.ts`, replace placeholders, set WhatsApp, set `NEXT_PUBLIC_SITE_URL`, enable robots), image credits link, library credits (Cult UI, Skiper UI, ShaderGradient).
- [ ] **Step 4:** Commit `docs: add README and security hardening`. Stop before any push/deploy — ask the user.

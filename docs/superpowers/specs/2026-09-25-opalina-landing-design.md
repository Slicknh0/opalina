# Opalina — Landing Page Premium (Design Spec)

Date: 2026-09-25
Package: **Avançado / Premium**
Nature: **portfolio demo** — fictional clinic, PT-BR, Brazilian market.

## 1. Purpose and success criteria

A sales piece for the author's web-design service: show real dental clinics the
premium level delivered. Success means:

- It reads as made for *this* clinic, not a template (passes the "swap the photos,
  is it a fintech?" test).
- Smooth on a mid-range phone (shader, motion, scroll).
- Passes the master prompt's quality gates (visual, technology, dental, conversion),
  accessibility AA, and a security pass before delivery.

### Honesty rules (non-negotiable)

The clinic is fictional. Concept, positioning, treatments and copy are demo content.
Anything that in a real clinic would be a verifiable claim is shown as a **visible
placeholder** and never as fact:

- reviews, Google rating, patient counts, years of experience;
- dentist name, CRO number, credentials, awards;
- prices, payment options, insurance;
- before/after images;
- address, phone, WhatsApp, opening hours.

Stock imagery is never presented as patients, results or the professional. The
footer carries a demo disclaimer.

## 2. Identity

- **Name:** Opalina — Estúdio de Odontologia Estética.
- **Location (fictional):** Jardins, São Paulo – SP.
- **Name check:** no "Opalina" dental clinic found in Brazil; "Nácar" was rejected
  (existing clinics in Spain); "Odontología Opal" exists in Colombia, name distinct.
- **Positioning:** boutique aesthetic dentistry — veneers (lentes de contato dental),
  porcelain facets, whitening, clear aligners, gum contouring, aesthetic rehab.
- **Primary CTA:** "Agendar avaliação" (WhatsApp). Secondary: call, form.

## 3. Design direction

**Concept — "Luz através do esmalte".** The site behaves like porcelain under natural
light: ivory surfaces, pearlescent reflections, quiet precision. Luxury through care,
not ornament. Primary direction: Luxury Cosmetic Dentistry (~85%). Secondary
influence: Clinical Editorial (~15%).

**Personality:** refined, calm, precise, warm without being casual.

### Palette (OKLCH tokens in Tailwind v4 `@theme`)

| Token | Role |
| --- | --- |
| `background` | ivory |
| `surface` | porcelain |
| `surface-muted` | bone |
| `foreground` | cool graphite |
| `muted` | graphite, reduced |
| `primary` / `primary-foreground` | graphite / ivory — main CTA |
| `accent` | ice blue — the "single ember": focus, active states, shade-guide details |
| `border` | porcelain line |
| `success` / `error` | desaturated green / red |

All text/background pairs validated at WCAG AA.

### Typography (`next/font/google`, self-hosted)

- **Display:** Newsreader (variable, optical size, italic for emphasis), light
  weights at large sizes.
- **Body:** Hanken Grotesk.
- **Technical:** IBM Plex Mono — eyebrows, captions, shade codes (A1, B1…). The
  "lab notebook" principle taken from Refero.

Type roles: `display`, `heading`, `body`, `supporting`, `eyebrow`, `caption`, `button`.

### Grid, shape, material

- 12 columns desktop / 4 mobile, generous margins, container ≈1280px.
- Controlled asymmetry: headings span 7 columns, supporting copy offset right.
- Shape language: the dental arch — elongated-oval image masks and one SVG arch
  line. Low radius (2–6px). No pills, no over-rounded cards.
- Material language: porcelain, glass, pearl, mineral light.

### Motion system

- Tokens: `--ease-porcelain: cubic-bezier(0.22, 1, 0.36, 1)`,
  `--ease-soft: cubic-bezier(0.65, 0, 0.35, 1)`; durations micro 160ms, UI 280ms,
  reveal 600ms, hero 1000ms.
- **Motion** (`motion/react`): section reveals, stagger, hover, layout transitions,
  mobile nav, treatment image reveal, shade-guide transitions.
- **Anime.js v4**: only the SVG arch draw (scroll-linked) and the hero headline
  choreography.
- The two libraries never animate the same property on the same element.
- `prefers-reduced-motion`: content visible and static, arch drawn in full, shader
  frozen as a static frame / CSS fallback.

### Shader

- `@shadergradient/react` (R3F v9 + React 19, as its docs require for App Router).
- Pearl palette ivory → cool pearl → ice; low speed; subtle grain.
- Used in the hero (ambient light) and the closing CTA band only.
- Pauses off-viewport, lower DPR on mobile, lazy-loaded (dynamic import, no SSR).
- Fallback: static CSS gradient with the same colors when WebGL is unavailable,
  reduced motion is on, or before the canvas mounts.

### Avoid

Tooth icons, purple gradients, bento grids, identical card rows, fake stats, fake
stars, stock "smile" photos, glass floating cards, Lucide icon walls.

## 4. Information architecture

Order follows the patient's decision path: *who / what → why trust → how → where*.

1. **Header** — wordmark, anchors (Tratamentos, Escala de cor, Método, Estúdio,
   Contato), CTA "Agendar avaliação". Becomes compact on scroll. Mobile: menu sheet
   plus a sticky bottom action bar (WhatsApp · Ligar).
2. **Hero** — eyebrow "Estúdio de odontologia estética · Jardins, São Paulo";
   headline about natural aesthetic dentistry; supporting copy; primary + secondary
   CTA; trust line about individual planning. Visual: shader light field, an
   oval-masked editorial image, the arch line starting here.
3. **Princípio** — short manifesto ("naturalidade antes de brancura") with Cult UI
   `text-animate` adapted.
4. **Tratamentos** — editorial numbered index (01–06). Desktop: hover/focus reveals
   an image in an oval mask that follows the active row. Mobile: disclosure rows.
   Each: name, short explanation, "indicado para", CTA.
5. **Escala de cor** (visual signature) — interactive shade guide inspired by the
   Vita scale dentists use. Selecting a shade tints an abstract arch of ovals and
   explains, in general terms, how shade is chosen to harmonize with skin, eyes and
   age. Message: "mais branco nem sempre é mais bonito". Educational, no claims.
6. **Método** — four-step scroll story (escuta → planejamento digital e ensaio →
   prova → execução e acompanhamento) with a sticky column; the arch draws as the
   steps advance.
7. **Profissional** — editorial portrait frame (placeholder texture, not a stock
   person), name/CRO/bio placeholders, philosophy quote placeholder.
8. **Avaliações** — large editorial quote slot showing a labeled placeholder
   ("Inserir avaliação real do Google") and a link slot to the Google profile.
9. **Perguntas frequentes** — native `<details>` accordion; general, cautious
   answers; price answered as "definido após avaliação".
10. **Contato & localização** — closing shader band, booking form, address, hours,
    map link, WhatsApp, phone (all placeholders).
11. **Footer** — responsible-technician line required by CFO advertising rules
    ("Responsável técnico: [NOME] — CRO-SP [NÚMERO]"), privacy note, demo disclaimer.

## 5. Components and responsibilities

```
src/
  app/            layout.tsx (fonts, metadata, JSON-LD), page.tsx, globals.css (@theme tokens)
  content/        clinic.ts — every piece of copy/data, placeholders marked in one place
  lib/            cn.ts, whatsapp.ts (link builder), booking.ts (validation), shades.ts
  components/
    layout/       Header, MobileNav, MobileActionBar, Footer
    sections/     Hero, Principle, Treatments, ShadeGuide, Method, Doctor, Reviews, Faq, Contact
    motion/       Reveal (Motion viewport reveal), ArchLine (Anime.js SVG), HeroTitle (Anime.js)
    shader/       AmbientShader (dynamic, client-only) + StaticGlow fallback
    ui/           Button/ButtonLink, Placeholder, Eyebrow, adapted Cult UI / Skiper pieces
```

- Sections are server components; interactivity lives in small client islands
  (Header scroll state, MobileNav, Treatments, ShadeGuide, Method/ArchLine, form,
  shader, reveals).
- All copy and data come from `content/clinic.ts`; placeholders use a `placeholder()`
  helper so the UI renders them in a distinct visual style and a test can count them.

### External libraries

- **Cult UI:** `text-animate` (manifesto) and `texture-card` / `bg-image-texture`
  surfaces for the portrait frame — copied from source, restyled to tokens.
- **Skiper UI:** free registry items only (verified: `skiper40`, `skiper31` return
  200; Pro items require a license). One item chosen for the treatment image reveal
  or text effect after inspection; ported from `framer-motion` to `motion/react` to
  avoid a duplicate dependency. If no free item fits, record why.
- **Refero:** no dental styles in the library; principles applied: warm-cream
  editorial (ElevenLabs, Intercom), single accent (Brex), lab-notebook mono details.
- **Behance (Lumi Dent):** inaccessible (HTTP 403 / 400 headless). Not analyzed.

## 6. Booking form and conversion

- Fields: Nome, WhatsApp, Tratamento de interesse (select), Mensagem (optional).
  No health data collected. LGPD notice under the button.
- Destination: builds a `wa.me` link with a prefilled message — no backend needed.
- States: default, focus, inline validation error, loading (brief), success
  (WhatsApp opened) and **not-configured**: while the clinic's WhatsApp number is a
  placeholder, submit shows "Demonstração: configure o número de WhatsApp para
  ativar o envio" instead of pretending to send.
- CTA appears in header, hero, after treatments, after method, closing band, and
  the mobile action bar.

## 7. SEO, accessibility, performance

- **SEO:** title, description, OpenGraph, canonical, semantic headings, alt text,
  `Dentist` JSON-LD with only non-placeholder fields. Local terms used naturally
  ("odontologia estética nos Jardins, São Paulo").
- **A11y:** landmarks, skip link, one `h1`, keyboard-operable treatment index and
  shade guide (radio-group semantics), visible focus in `accent`, 44px targets,
  labels on all fields, reduced motion.
- **Performance:** server components by default, shader lazy and paused
  off-screen, `next/image` with AVIF/WebP, font `display: swap` with subsetting,
  transform/opacity-only animation, no layout shift from reveals.
- **Breakpoints validated:** 320, 360, 390, 430, 768, 1024, 1280, 1440, 1920.

## 8. Imagery

Material/light macro photography (porcelain, ceramics, glass, soft light) from a
license-compatible source (Unsplash), downloaded locally and optimized; credits in
README. If sourcing fails, sections fall back to shader/texture surfaces. The
professional portrait and the studio photos are placeholders.

## 9. Testing and verification

- **Vitest:** `whatsapp.ts`, `booking.ts` validation, `shades.ts` data, placeholder
  helper.
- **Playwright:** page renders, one h1, anchors navigate, treatment index keyboard,
  shade guide selection, form validation and not-configured state, reduced motion.
- **Gates:** `tsc`, lint (Biome), `next build`.
- **Visual QA:** agent-browser screenshots at the listed breakpoints, then
  impeccable / frontend-design / web-design-guidelines review and refinement.
- **Security (end):** security headers (CSP compatible with WebGL), dependency
  audit, gitleaks, `security-review`, claude-red `web` + `supply-chain` checks.

## 10. Non-goals

CMS, blog, multi-language, real booking backend, analytics, dark mode, deployment
(not without explicit request).

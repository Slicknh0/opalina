# Opalina — 3D Tooth Scene and Treatment Renders (Design Spec)

Date: 2026-09-25
Builds on: `2026-09-25-opalina-landing-design.md` (branch `feat/landing`)
Branch: `feat/tooth-scene`

## 1. Purpose and success criteria

Bring the landing page up to the "Avançado / Premium" bar with a cinematic,
scroll-driven 3D tooth in the hero — the move seen in the Lumi Dent reference
(Behance) and in Awwwards 3D/health winners — and replace the treatment SVG
specimens with photoreal renders in the same style.

Success means:

- The hero reads as a photoreal glass-and-porcelain molar that turns and then
  reveals its layers and an implant as the visitor scrolls.
- No visible AI artefacts in any frame the visitor can land on (no melting roots,
  no changing root count).
- Performance stays at Lighthouse mobile Performance ≥ 80, CLS 0, LCP not worse
  than today.
- Reduced-motion and no-JS visitors get the full story as static content.
- The Agnes API key never appears in any committed file or in the shipped site.

## 2. Decisions already made

- **Approach:** hybrid. Rotation = Agnes video scrubbed by scroll; layers and
  implant = Agnes stills with 2.5D transitions; treatment visuals = Agnes stills.
  Rationale: the spike showed Agnes stills are studio-quality at 1024px, while a
  5 s image-to-video spin kept the crown and background stable but morphed the
  roots (3→2→3) after ~2.4 s, drifted from glass to metallic, and came back at
  640×640 although 768 was requested.
- **Scope:** hero scene + treatment renders. Palette, typography, shade guide,
  method, doctor, reviews, FAQ, contact and form stay as they are.
- **Interaction:** cinematic sequence driven by scroll.

## 3. The tooth scene (replaces Hero and Principle)

A pinned scene ~300vh tall on desktop (~200vh on mobile). Title left, tooth
right, over a giant, very light "Opalina" wordmark in Newsreader that the tooth
overlaps (depth through typography).

| Scroll progress | Visual | Copy |
| --- | --- | --- |
| 0 (on load) | Poster still `tooth-k1` (1024px, sharp) | h1 "Estética dental com a naturalidade da luz." + lead + CTAs + trust line |
| 0 → 0.35 | Canvas frame sequence: the tooth turns ~45° | "A luz atravessa o esmalte…" |
| 0.35 → 0.70 | Oval mask wipe to the layered cutaway still; Anime.js draws leader lines to enamel, dentine and pulp, then the labels appear | "Naturalidade antes de brancura." + one line on how each layer changes how light is reflected |
| 0.70 → 1 | Oval mask wipe to the implant still (crown, abutment, screw; same pose) | "Quando falta um dente, devolvemos forma e função." + CTA |

Library ownership:

- **Canvas frame sequence:** plain canvas 2D; progress from Motion `useScroll`.
- **Motion:** mask wipes, crossfades, beat copy.
- **Anime.js:** SVG leader lines and label reveal (timeline + `svg.createDrawable`),
  synced to the scene progress. It never touches elements Motion animates.
- **ShaderGradient:** pearl halo behind the tooth. The tooth images use
  `mix-blend-multiply` so their porcelain background merges with the halo. If the
  blend reads muddy in QA, the halo is dropped from the scene (the contact band
  keeps the shader) — record that as a ruling.

Mobile: tooth above the copy, shorter scene, half the frames.

Reduced motion / no JS: no pinning, no canvas, no video. The three stills are
stacked, each with its beat copy and labels as plain HTML.

## 4. Treatment renders

The editorial treatment index stays (a grid of six identical cards is the most
generic pattern the impeccable craft floor bans). The sticky panel and the mobile
open row show an Agnes render instead of the SVG specimen, with the existing
crossfade + slight zoom. A small caption reads "Ilustração 3D".

| Treatment | Render |
| --- | --- |
| lentes | Glass incisor with a thin porcelain veneer floating in front of it |
| facetas | The same incisor with a thicker porcelain facet fitting onto it |
| clareamento | Three incisors side by side, warm to light shade |
| alinhadores | Clear aligner tray floating above a row of glass teeth |
| gengiva | Two glass teeth with a soft, matte pale-pink gum contour (abstract) |
| reabilitacao | Crown on implant, exploded into three pieces (same asset as scene beat 4) |

No people, patients or before/after images. Renders are illustrative objects.

## 5. Asset pipeline

Location: `scripts/agnes/` (plain Node 24, no new runtime dependency).

- `assets.json` — versioned manifest. Per asset: `id`, `kind`
  (`image` | `image-edit` | `keyframes-video`), `prompt`, `inputs` (asset ids),
  `size`, plus one shared `styleSuffix` appended to every prompt (material, light,
  camera, cool porcelain background).
- `generate.mjs` — calls Agnes (`https://apihub.agnes-ai.com/v1`):
  - key from `.env.local` via `process.loadEnvFile`; aborts if missing; never logs it;
  - images: `POST /v1/images/generations`, model `agnes-image-2.1-flash`; edits pass
    the input image URL returned by an earlier generation;
  - video: `POST /v1/videos`, model `agnes-video-v2.0`,
    `extra_body: { image: [k1Url, k2Url], mode: "keyframes" }`, `num_frames` 8n+1,
    polled at `GET /agnesapi?video_id=`;
  - idempotent (skips outputs that exist), `--only <id>`, `--dry-run`, retries 429.
- `process.mjs` — ffmpeg:
  - video → WebP frames: desktop 48 frames at 960px, mobile 24 at 640px;
  - stills → WebP at 1600 / 1024 / 640 wide for `srcset`.
- Raw outputs in `art/raw/` (gitignored). Final assets in `public/tooth/` and
  `public/treatments/` (committed). Nothing calls the API at runtime.
- `next/image` is not used (its optimizer needs `sharp`, whose build is blocked);
  responsive `<img srcset>` with pre-generated sizes instead.

Consistency: `tooth-k1` is the anchor, regenerated on a cool porcelain background.
The turned view (`tooth-k2`), the cutaway and the implant are image-to-image edits
of `tooth-k1`. The rotation video uses keyframes mode k1→k2 so both ends are
pinned. Any frame range with visible morphing is trimmed before extraction.

Budget: ~12 image calls and 2–3 video calls including retries; ~20 min wall time
(video limit 1 RPM on the free tier).

## 6. Loading and performance

- Poster `tooth-k1` renders immediately with fixed aspect ratio (CLS 0) and is the
  LCP candidate together with the h1.
- Frames, the halo shader and treatment renders load after first interaction or
  when near the viewport; frames decode via `createImageBitmap`. Until a frame is
  ready the canvas keeps the poster, never a blank.
- The canvas redraws only when the frame index changes (rAF) and stops when the
  scene is off-screen.
- Mobile picks the 640px / 24-frame set from viewport width.

## 7. Accessibility

- Real HTML text for h1 and every beat; canvas and decorative layers `aria-hidden`.
- Descriptive `alt` on stills ("Ilustração 3D de um molar de vidro…").
- Layer labels are HTML text, not baked into images.
- Keyboard focus reaches CTAs inside the pinned scene without trapping.
- Wordmark is decorative and very light; text over it meets AA.

## 8. Testing and verification

- **Unit (Vitest):** progress → frame index (bounds 0 and 1, rounding, desktop and
  mobile sets); beat for progress; manifest validation (unique ids, inputs refer to
  earlier assets, `num_frames` 8n+1).
- **E2E (Playwright):** scene present and poster loaded; scrolling changes the drawn
  frame; labels visible in beat 3; reduced motion → no canvas, no pinning, three
  stills visible; global page-error guard stays.
- **Visual:** screenshots at 320–1920 and an impeccable pass (craft floor + detector).
- **Security:** key only in `.env.local`; secret scan of the diff for the key and
  `sk-` patterns; CSP unchanged (`img-src 'self'` suffices).
- **Performance:** Lighthouse mobile, Performance ≥ 80, CLS 0.

## 9. Non-goals

Runtime generation, Lumi Dent palette/typography switch, audio, changes to the
shade guide, method, doctor, reviews, FAQ, contact or form.

## 10. Security note

The Agnes key was pasted in plain text in the chat. After the assets are
generated, the user should revoke it in the Agnes dashboard and create a new one.

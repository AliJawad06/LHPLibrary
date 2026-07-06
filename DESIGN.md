<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: LHP Library
description: Online catalog UI for the Light House Project's book library — reverent, refined, traditional; book covers foregrounded, Islamic geometry as punctuation.
---

# Design System: LHP Library

## 1. Overview

**Creative North Star: "The Community Kutubkhana"**

The kutubkhana — the book-room of a mosque, madrasa, or family compound — is the reference point. A quiet, dignified place organized around the object of the book. The catalog UI should feel like walking that room: the shelves are curated, the light is even, the walls carry restrained geometric ornament, and nothing in the architecture competes with the books themselves. The tone is reverent without being solemn; refined without being austere.

The palette is committed to deep, quiet neutrals with the Light House Project's navy as the single organizing accent. Warmth in the brand comes from imagery (borderless book covers that carry their own backgrounds) and from the geometric flourishes drawn from Islamic tradition — not from the body background. This system explicitly rejects the four failure modes named in `PRODUCT.md`: it is not a warm-cream AI-editorial site, not a gold-and-mosque-silhouette cliché, not a bright-teal SaaS catalog, and not a rounded-primary-color kids' UI.

**Key Characteristics:**
- **Book-first hierarchy.** Borderless covers dominate every screen; chrome recedes.
- **Restrained committed color.** One accent (LHP navy) doing 10–15% of the work.
- **Serif display, humanist sans body.** Reverent titles, unhurried reading.
- **Islamic geometry as punctuation.** Small framing accents, never wallpaper.
- **Motion is response, not choreography.** Gentle transitions between states; no scroll theater.

## 2. Colors

The palette is a single committed accent (LHP navy) held against a deep, low-chroma neutral field. The neutrals are **not** warm cream; the field reads as ink-adjacent stone, closer to a slate than to parchment. Book covers, which include their own backgrounds, provide the color variety on any given screen.

### Primary
- **LHP Navy** [exact value to be resolved from lhproj.com brand — see note]: Nav bar, primary links, active filter chip fill, focus rings, section-heading ornament color. The organizing accent. Aim for a deep, slightly desaturated navy — not electric, not black-cored. OKLCH space to be committed at build time.

### Neutral
- **Field** [to be resolved during implementation]: Body background. A deep, cool-neutral tint (OKLCH lightness ≈ 0.94–0.96, chroma ≈ 0.005–0.010 toward the navy hue). Explicitly **not** warm-parchment.
- **Surface** [to be resolved]: Section/panel background, one to two steps darker than Field for gentle tonal layering.
- **Divider** [to be resolved]: 1px hairlines and shelf separators, low chroma, low contrast.
- **Ink** [to be resolved]: Primary text. Deep near-black with a whisper of the navy hue, not pure `#000`. Must hit ≥ 4.5:1 on Field and Surface.
- **Ink-muted** [to be resolved]: Secondary text (author names, dates, metadata). Must also hit ≥ 4.5:1 — never the light-gray "elegance" default.

### Named Rules

**The Book-Is-Loudest Rule.** No chrome element — no header, no filter chip, no section title — may out-compete a book cover in saturation or contrast. If a filter chip in its active state visually reads louder than the covers it's surfacing, tone the chip down.

**The Cream Ban.** No `--paper`, `--cream`, `--sand`, `--linen`, `--parchment`, `--bone`, `--wheat` tokens. No body background in the OKLCH warm-neutral band (L 0.84–0.97, C < 0.06, hue 40–100). This is the saturated 2026 AI-editorial default; the brief explicitly rejects it.

**The Navy-Only Accent Rule.** LHP navy is the *only* accent. No secondary teal, no warm brand-yellow, no purple hover state. Emphasis comes from weight, size, and negative space — not from adding another color.

## 3. Typography

**Display Font:** [to be chosen at implementation — recommend a refined transitional or old-style serif; candidates: Cormorant Garamond, EB Garamond, Fraunces (Light optical size)]
**Body Font:** [to be chosen at implementation — recommend a humanist sans; candidates: Public Sans, Inter with humanist tuning, Söhne, or IBM Plex Sans]
**Label / Metadata Font:** Same body sans at a smaller size, tighter tracking. No third family.

**Character:** Contrast-pair: high-contrast serif (calligraphic bones, thin strokes) against a warm humanist sans (open apertures, readable at 15–17px). The pairing should feel like a library card catalog set alongside a modern reading room — historical reference, contemporary body copy.

### Hierarchy
- **Display** (Light or Regular weight, `clamp(2.5rem, 5.5vw, 4rem)`, `line-height: 1.05`, `letter-spacing: -0.02em`): Page titles ("The Library", shelf names on hero rows). `text-wrap: balance` for even line breaks. Absolute ceiling: 4rem — no shouting.
- **Headline** (Regular, `clamp(1.75rem, 3vw, 2.25rem)`, `line-height: 1.15`): Section headings ("New Arrivals", "Staff Picks", "By Topic").
- **Title** (Medium sans, `1.125rem`, `line-height: 1.3`): Book titles under covers.
- **Body** (Regular sans, `1rem`, `line-height: 1.6`, max `70ch`): Descriptions, editorial notes, about-the-collection copy.
- **Metadata** (Regular sans, `0.875rem`, `line-height: 1.4`): Author names, dates, categories, availability.
- **Label** (Medium sans, `0.8125rem`, `letter-spacing: 0.01em`): Filter chip labels, form labels. **Not uppercase**; regular case only — the tiny-tracked-uppercase eyebrow is banned.

### Named Rules

**The Reading-Room Rule.** Body text is 16–17px minimum, line-height ≥ 1.6, line length capped at 70ch. This is a library UI; reading is the primary act. Below 16px body is prohibited.

**The Eyebrow Prohibition.** No small-uppercase-tracked kickers above section headings ("BROWSE" over "New Arrivals"). The serif headline carries the section on its own. This is a named ban from `PRODUCT.md`; it is repeated here for the visual spec.

**The Arabic-Pairing Rule.** Any Arabic titles or transliterations render in the display serif's Arabic companion (or a paired Naskh face) with `lang="ar"` set for screen readers. English rendering appears alongside, never in isolation.

## 4. Elevation

Depth in this system is **architectural, not atmospheric**. Surfaces are flat at rest. Layering is signaled by tonal steps (Field → Surface → Surface-raised) and by hairline dividers, not by drop shadows. When a shadow does appear, it's a specific response to state (hover-lifted cover preview, open dialog) — never ambient decoration on every card.

### Shadow Vocabulary (used sparingly)

- **Hover-lift** (`box-shadow: 0 8px 24px -12px rgba(navy, 0.18)`): Applied only to book covers on hover, and only when a hover is meaningful (i.e., the cover navigates somewhere). The shadow tints toward navy, not neutral gray.
- **Dialog** (`box-shadow: 0 24px 64px -16px rgba(ink, 0.24)`): Modal book-detail views and dropdown filter menus. The only "lifted" surface class in the system.

### Named Rules

**The Flat-Bookshelf Rule.** Book covers sit on the surface, not floating above it. No default drop shadow on the cover grid. The cover's own edge (or the transparency around a borderless cover) creates its silhouette against the Field.

**The No-Ambient-Glow Rule.** Backdrop-blur, glassmorphism, and ambient outer glows are prohibited. If a surface needs to feel raised, use a tonal step or a hairline. Blur is reserved for the modal scrim only.

## 5. Components

*Component tokens will be captured on the next `/impeccable document` run once code exists. During `/impeccable craft`, synthesize component styles from the primitives above and the rules below.*

### Guidance for the first build

- **Book cover cell**: no border, no default shadow, no rounded corner on the cover *image itself* (the image carries its own background/composition). Cell wrapper may have a subtle radius (≤ 4px) applied to the hover-state focus ring only. Title in Title style beneath the cover, author in Metadata style beneath the title.
- **Shelf row**: horizontal scrolling row with a serif Headline label at left and a soft edge-fade to signal more content off-screen. Small Islamic-geometry motif (see below) as a divider between rows.
- **Filter chip**: pill-shaped, `padding: 8px 14px`, `border-radius: 999px`. Default state: 1px navy hairline border, transparent fill, ink text. Active state: navy fill, Field-color text. **Do not** use tinted-navy-at-10%-alpha as a "soft" active state — the contrast fails.
- **Search input**: single-line, 1px navy hairline underline (bottom border only) on Surface. Focus state: underline thickens to 2px, cursor gets navy caret color. No box-outline.
- **Islamic geometry accents**: SVG-inline, single-color (Ink-muted or Navy at 12–18% opacity), placed **only** at (a) row dividers between shelves, (b) small corner marks at empty-state illustrations, (c) an ambient background band behind the top nav or footer. Never as a full-page tiled watermark. Suggested sources of authentic geometry: 6-, 8-, or 10-point star tilings; no domes, no crescents, no calligraphy substitutes.

### Named Rules

**The Borderless-Cover Rule.** Cover images ship as the book photographer captured them — with their own background/composition, not on a manufactured card. The UI must not draw a border, drop shadow, or rounded corner on the cover image itself. Cell chrome (focus rings, hover states) sits *around* the image, not on it.

**The Pattern-Is-Punctuation Rule.** Islamic geometric motifs appear as small, deliberate accents (dividers, corner marks, one ambient band). Total motif surface area on any given screen: less than 5%. Opacity: 12–18%. Any use above this budget is prohibited; the pattern is punctuation, not wallpaper.

## 6. Do's and Don'ts

### Do:
- **Do** anchor the palette on a deep, cool-neutral Field with LHP navy as the sole accent.
- **Do** ship every book cover borderless; let its own composition sit directly on the Field.
- **Do** pair a high-contrast serif display with a humanist sans body; use only two families.
- **Do** use small Islamic geometric motifs (6/8/10-point star tilings) as row dividers, corner marks, and one ambient band — 12–18% opacity, <5% of screen area.
- **Do** verify ≥ 4.5:1 contrast for all body text, ≥ 3:1 for large text and UI controls, on **every** neutral in the system.
- **Do** cap body line length at 65–75ch and set body ≥ 16px, line-height ≥ 1.6.
- **Do** provide a reduced-motion alternative (crossfade or instant) for every transition.
- **Do** treat filter chips as real form controls (buttons with `aria-pressed`), not clickable divs.
- **Do** set `lang="ar"` on any Arabic strings and pair with English rendering.

### Don't:
- **Don't** use warm-parchment / cream / beige body backgrounds. No `--paper`, `--cream`, `--sand`, `--linen`, `--parchment`, `--bone`, `--wheat` tokens. (From PRODUCT.md: *"cream/beige everything (the AI-warm-editorial default)"*.)
- **Don't** use heavy metallic gold, mosque silhouettes, crescent icons, calligraphy substitutes, or Papyrus/faux-Arabic fonts. (From PRODUCT.md: *"stereotyped 'Islamic' clichés"*.)
- **Don't** default to bright teal + white + over-rounded cards. (From PRODUCT.md: *"generic SaaS library"*.)
- **Don't** use rounded display fonts, cartoon icons, or bright primary colors. (From PRODUCT.md: *"overly playful / kids-focused"*.)
- **Don't** put small-uppercase-tracked eyebrows above section headings. The serif headline stands alone.
- **Don't** number sections as `01 · New Arrivals / 02 · Staff Picks` unless the order carries real information. Curated shelves are not a sequence.
- **Don't** apply borders, drop shadows, or radii to book cover images themselves. Chrome sits around, not on.
- **Don't** use gradient text, glassmorphism, or ambient glow decoratively. Blur is reserved for the modal scrim.
- **Don't** use `border-left` > 1px as a colored accent stripe on cards or callouts.
- **Don't** tile the Islamic pattern as full-page wallpaper. Pattern is punctuation, not backdrop.
- **Don't** introduce a second accent color. Emphasis comes from weight, size, and space, not from another hue.

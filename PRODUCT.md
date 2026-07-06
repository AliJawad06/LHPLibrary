# Product

## Register

product

## Users

Members and visitors of The Light House Project (lhproj.com), a Muslim American community organization in the North Carolina Triangle. Primary users are community members — parents choosing books for children, students researching topics in Islamic studies, adults looking for reading suggestions, and volunteers curating shelves. They visit the library online to browse the org's physical/curated collection: what's on the shelf, what's new, what's recommended on a given topic. Context is unhurried — evenings at home, weekends, sometimes on a phone at the masjid. The primary job is *discovery*: "what should I read next?" more than "find this specific ISBN."

## Product Purpose

An online catalog of the Light House Project's book library. Ship a UI that lets members browse curated shelves (New arrivals, Staff picks, By topic) and filter/search when they know what they want. Book covers are the visual anchor. Success means members open the site, see something they want to read within 15 seconds, and can find related titles without hunting.

The library is a *service* the org offers its community — the design should feel like an extension of the org, not a generic catalog app grafted on.

## Brand Personality

**Reverent · Refined · Traditional.** Voice is calm, respectful, and unhurried — the register of a well-kept masjid library, not a bookstore or a SaaS product. Copy is direct and warm without being casual; no exclamation marks, no "Grab yours now!" energy. The interface should feel considered: something a khateeb or a librarian would trust to represent the collection.

Emotional goal: quiet dignity. A member should feel the org cares about books, not that it's chasing engagement metrics.

## Anti-references

The user rejected all four common failure modes for this brief — treat each as a hard "do not become this":

1. **Cream / beige / warm-parchment everything** (the saturated AI-editorial default of 2026). No `--paper`, `--sand`, `--linen`, `--cream` neutrals. No warm-tinted near-white body backgrounds. Warmth in this brand comes from imagery and accent, not from body bg.
2. **Stereotyped "Islamic" clichés**: heavy metallic gold on black, mosque-silhouette imagery, Papyrus / faux-Arabic display fonts, generic dome/crescent iconography. The Islamic pattern motif is *geometric* and *architectural*, not touristy.
3. **Generic SaaS library UI**: bright teal + white, over-rounded card grid, empty airy layout with no character. This is a community library, not Airbnb-for-books.
4. **Overly playful / kids-focused**: rounded display fonts, bright primaries, cartoon icons. Even a children's shelf should sit under the same reverent visual system.

## Design Principles

1. **The book is the hero.** Cover images (borderless, background-inclusive as the org has planned) do 80% of the visual work on every page. Chrome recedes so covers can breathe.
2. **Pattern as punctuation, not wallpaper.** Islamic geometric motifs appear as small framing accents — near section headings, at card corners, as dividers — low opacity, deliberate placement. Never as a maximalist wash across the surface.
3. **Reverent restraint.** The typographic and spatial rhythm should feel unhurried. Wide margins, careful hierarchy, no visual shouting. If a decision could go louder or quieter, go quieter.
4. **Browse-first, filter-second.** The landing view is curated shelves (New, Staff picks, By topic). Filters and search are always accessible but don't dominate the first screen — the experience is walking through the library, not querying a database.
5. **Extension of the org, not a bolt-on.** Visual system should feel continuous with lhproj.com, not a foreign app the org happens to link to.

## Accessibility & Inclusion

- **WCAG AA** across the board: 4.5:1 body-text contrast, 3:1 for large text and UI controls, visible focus rings, full keyboard navigation, semantic landmarks and headings, alt text on every cover, filter chips as real form controls (not divs).
- Reduced-motion alternative for every animation (crossfade or no transition).
- Copy is plain English at first; if Arabic titles or transliterations appear, they're paired with the English rendering. `lang` attribute set correctly on Arabic strings so screen readers pronounce them.
- Design must work at 200% zoom and on small phones; the org's audience is intergenerational and reads on whatever device is at hand.
- No color-only meaning — filter state, availability status, etc., always carry a text or icon signal alongside color.

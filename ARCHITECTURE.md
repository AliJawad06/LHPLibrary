# LHP Library — Software & Architecture

What the software is, how it's shaped, and the reasoning behind each page.
Companion to [README.md](README.md) (how to run) and [SETUP.md](SETUP.md) (one-time setup).

## The software in one paragraph

A single-copy lending library: each book record **is** the lendable item. Members browse
a curated catalog, borrow available titles (14 days, max 5 at once), and join FIFO hold
queues for titles that are out. Librarians manage the catalog, circulation, and roles
from an in-app desk. Every screen updates live — no refresh, no polling — because all
reads are Convex reactive subscriptions.

## System shape

```
Browser ── WebSocket ──► Convex deployment
   │                        ├─ Better Auth component (users/sessions, OAuth, /api/auth/*)
   │                        └─ App tables + functions (books, loans, holds, profiles)
   └── HTTPS ──► Next.js on Cloudflare Workers (shell, SSR, middleware)
```

Three load-bearing decisions, everything else follows from them:

1. **Authorization lives in the data layer.** Every Convex function resolves the caller
   via `convex/lib/authz.ts` (`requireUser` / `requireAdmin`) before touching data.
   Next.js `middleware.ts` and hidden UI are convenience; a crafted client call to any
   privileged function still fails at the backend. This is why the frontend can be
   simple — pages never need to be "secure", only honest.

2. **`books.status` is transactionally maintained, never derived and never trusted from
   clients.** It is written exclusively inside `loans.borrow`, `loans.returnBook`, and
   `admin.forceReturn` — the same serializable mutation that writes the loan row. Two
   members racing for the last copy is resolved by Convex's optimistic concurrency:
   one commits, the other re-runs, sees `loaned`, and fails cleanly. No locks, no
   `SELECT FOR UPDATE`, no status drift.

3. **The reactive query is the state manager.** No Redux/Zustand/SWR. `useQuery`
   subscriptions are the single source of truth; mutations write and the UI follows.
   The only client state is view state (open modal, filter selections, form fields).

## Page-by-page decisions

### `/` — Catalog (`app/page.tsx` → `components/Catalog.tsx`)

- **Server shell, client body.** The page component is a server component that renders
  static chrome (header, ambient ornament, footer); all data-driven UI lives in the
  `Catalog` client component. Nothing here needs SSR data — the catalog is public and
  arrives over the WebSocket subscription.
- **One subscription, client-side filtering.** The page subscribes once to
  `books.list({})` and applies multi-select facet filtering + multi-field search
  (title/author/publisher/description) in a `useMemo`. Rationale: the catalog is small
  (tens of titles), one subscription gives live availability on every card for free,
  and multi-select facets + fuzzy multi-field search would otherwise need N server
  round-trips per keystroke. The server-side `books.search` (search index on title)
  exists in the API surface for when the catalog outgrows this; the swap point is
  isolated inside `Catalog`.
- **Browse-first layout.** Default view is curated shelves (New Arrivals, Staff Picks,
  By Topic) per PRODUCT.md's "browse-first, filter-second" principle; any active filter
  or query swaps the whole region to a results grid. The two views are mutually
  exclusive on purpose — filtering a "shelf" metaphor in place reads as items vanishing.
- **Book detail is a modal, not a route.** Native `<dialog>` (focus trap, Esc, backdrop
  for free). While open, it runs its own `books.get` subscription so availability can
  flip *while you're looking at it* — the borrow button becomes a hold button live.
  Trade-off accepted: no shareable per-book URL in v1.
- **Action buttons are state-derived**: your active loan → Return; available → Borrow;
  loaned + your hold → Leave queue (with position); loaned → Join queue; signed out →
  Sign in. Server errors (`BorrowLimitReached`, `BookNotAvailable`…) map to human copy
  via a `ConvexError` code table — the mutation's thrown code is the contract.

### `/signin` (`app/signin/page.tsx` → `components/SignInPanel.tsx`)

- **Auth endpoints live on Convex, not Next.** Better Auth runs as a Convex component;
  the panel's `authClient` calls hit the Convex-hosted routes. This is why the Google
  OAuth redirect URI points at `*.convex.site` and survives any web-host change
  (Vercel → Cloudflare cost zero auth changes).
- **Sign-in and sign-up are one panel with a mode toggle** — a community library
  doesn't need separate routes for a three-field form.
- **`redirect` query param** carries the middleware's origin path so a bounced user
  lands where they intended. Wrapped in `<Suspense>` because `useSearchParams` requires
  it under App Router SSR.

### `/account` — My shelf (`app/account/page.tsx` → `components/MyShelf.tsx`)

- **Two-layer gating.** `middleware.ts` redirects signed-out visitors (UX);
  `me.loans` / `me.holds` call `requireUser` server-side (enforcement). The queries are
  scoped by caller identity from the session — there is no "userId" argument to forge,
  which is how M7's "only ever my own data" is guaranteed structurally.
- **Conditional subscriptions** use Convex's `"skip"` token until `me.get` resolves,
  so the page never fires auth-required queries while signed out.
- **Queue position is derived, not stored** — computed by ordering the book's waiting
  holds by `createdAt` at read time. A stored position integer would need re-numbering
  on every cancel/fulfill; derivation can't go stale.
- **Due-date urgency is presentation logic** (≤3 days → amber, overdue → text) computed
  client-side from `dueAt`; the backend stores timestamps, not display states.

### `/admin` — Librarian desk (`app/admin/page.tsx` → `components/AdminPanel.tsx`)

- **The client-side role check is cosmetic** (shows "Librarian access required" to
  non-admins); every `admin.*` function re-runs `requireAdmin`. The page renders for
  anyone; the data won't.
- **Four tabs, one page.** Catalog CRUD, loans, holds, members share context (toast,
  role) and a librarian rarely needs deep links into them; separate routes would add
  ceremony without value at this scale.
- **Delete is blocked while a book is on loan** (`BookHasActiveLoan`) and cancels the
  book's waiting holds in the same mutation — no queue may point at a dead book.
- **Force-return reuses the member return path** (`closeLoanAndPromoteHold` in
  `convex/loans.ts`), so hold promotion behaves identically no matter who closes the
  loan. One lifecycle, two entry points.
- **Self-demotion is rejected** (`CannotDemoteSelf`) so the org can't accidentally end
  up with zero admins. The first admin is bootstrapped via `admin:bootstrapAdmin`, an
  `internalMutation` callable only from the CLI/dashboard — the promote-a-user
  capability physically cannot be reached from a browser.

### `/api/auth/[...all]` (`app/api/auth/[...all]/route.ts`)

- A two-line proxy: forwards `/api/auth/*` to the Convex-hosted Better Auth routes so
  auth cookies live on the app's own domain. All logic is upstream in
  `convex/auth.ts` + the component.

### `middleware.ts`

- Guards `/account` and `/admin` only. **Fails open to "signed out"** (redirect) if the
  token endpoint is unreachable rather than surfacing a 500 — safe precisely because
  middleware is UX and Convex functions are the gate. Runs on the default edge runtime,
  which is what Cloudflare Workers supports.

### Root layout (`app/layout.tsx` + `components/ConvexClientProvider.tsx`)

- Server-side `getToken()` feeds `initialToken` into `ConvexBetterAuthProvider`, and the
  Convex client is created with `expectAuth: true` — together they prevent the classic
  flash-of-logged-out and stop auth-gated queries from executing before the token
  arrives.
- Fonts load in the layout head (Cormorant Garamond display / Public Sans body / Amiri
  for Arabic) — the same three-role pairing as the prototype.

## Data model decisions (`convex/schema.ts`)

- **`loans` is the workflow object** — an event with a lifecycle — rather than fields
  on the book. Invariant: at most one `active` loan per `bookId`, enforced inside the
  borrow mutation by decision 2 above.
- **Hold fulfillment auto-creates the next loan** in the same return mutation (v1
  policy for the spec's open question). The book never transits through `available`
  when a queue exists, so nobody can snipe a held book.
- **`role` lives in an app-owned `profiles` table**, not as a Better Auth
  additionalField/JWT claim (deviation from spec §4.1). The pinned component version
  (0.12.5) has no stable server-side path to update an additionalField, which
  promote-user needs; and a reactive `me.get` role beats a JWT claim anyway — changes
  apply instantly, not on token refresh. Enforcement point is unchanged.
- **Seeds are all `available`** — seeding a `loaned` book with no loan row would strand
  it forever, since only a return can free it.

## Design system

The visual system predates the app (see `DESIGN.md`, prototype in `prototype/`):
OKLCH tokens in `app/globals.css`, LHP navy as sole accent on a cool neutral field,
borderless typography-forward cover placeholders (real photography drops into
`components/BookCover.tsx` later), Islamic geometry as punctuation only (ambient header
band, shelf dividers, empty-state mark — never per-card, never wallpaper). New app
surfaces (auth, tables, line items, toasts) extend the same tokens rather than
introducing a second vocabulary.

## Hosting

Cloudflare Workers via `@opennextjs/cloudflare` (`wrangler.jsonc`,
`open-next.config.ts`). No ISR/caching bindings — every route is dynamic by design,
since page data is client-subscribed. The single `next/image` use was replaced with a
plain `<img>` (26px avatar) rather than wiring a Cloudflare image loader for one icon.

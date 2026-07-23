# LHP Library

The community bookshelf of [The Light House Project](https://www.lhproj.com) (Cary, NC).
Members browse a curated catalog of Islamic texts and contemporary Muslim American
writing, borrow available titles, and join FIFO hold queues when a title is out.
Librarians manage the catalog and circulation from an in-app desk.

**Stack:** Next.js (App Router) · Convex (reactive DB + backend functions) ·
Better Auth via `@convex-dev/better-auth` (pinned `0.12.5`) · Google OAuth + email/password.

| Path | What it is |
|---|---|
| `app/`, `components/`, `lib/` | Next.js frontend (design system in `app/globals.css`) |
| `convex/` | Schema, auth, and all backend functions (authorization lives here) |
| `prototype/` | The original static HTML/CSS/JS prototype, kept for reference |
| `ARCHITECTURE.md` | The software + per-page architecture decisions |
| `SETUP.md` | One-time setup detail (OAuth credentials, env vars, architecture notes) |
| `PRODUCT.md` / `DESIGN.md` | Product strategy + visual design system |

---

## Running in development / test

### One-time setup

```bash
npm install
npx convex dev        # interactive: log in (or pick a local anonymous deployment)
```

`npx convex dev` creates the dev deployment, regenerates `convex/_generated/`,
and writes real values into `.env.local`. Keep `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

Then set auth env vars **on the Convex deployment** (not `.env.local`):

```bash
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
npx convex env set SITE_URL http://localhost:3000
npx convex env set GOOGLE_CLIENT_ID <dev-client-id>
npx convex env set GOOGLE_CLIENT_SECRET <dev-client-secret>
npx convex env set GOOGLE_CALENDAR_ID <public-calendar-id>
npx convex env set GOOGLE_API_KEY <calendar-api-key>
```

Then populate pickup events once (`npx convex run events:sync` — an hourly cron keeps
them fresh; see SETUP.md §2b for the Calendar API key + calendar ID).

Google credential setup (redirect URI is on the **app's own origin** —
`<SITE_URL>/api/auth/callback/google` — because the OAuth callback flows through the
Next `/api/auth` proxy): see **SETUP.md §2**. Email/password sign-in works with no
Google credentials, so you can skip Google while testing locally.

Seed the catalog (idempotent, 27 titles):

```bash
npx convex run seed:run
```

### Every day

```bash
npm run convex        # terminal 1 — Convex dev server + codegen watch
npm run dev           # terminal 2 — Next.js on http://localhost:3000
```

### Bootstrap the first librarian

Sign in once in the app, then:

```bash
npx convex run admin:bootstrapAdmin '{"email": "you@example.com"}'
```

(`internalMutation` — CLI/dashboard only, clients can never call it.
After the first admin exists, promote others from **Admin → Members** in the app.)

### Manual test plan

There is no automated test suite yet; these scenarios cover the spec's
acceptance criteria:

1. **Browse signed out** — catalog, filters, and search work; borrow prompts sign-in.
2. **Borrow / return** — borrow an available book (due date = +14 days, card flips
   to "Checked out" live in a second browser); return it from My shelf or the modal.
3. **Race for the last copy** — two browsers, two accounts, same book, click Borrow
   near-simultaneously: exactly one succeeds, the other gets the hold prompt.
4. **Borrow limit** — 6th active borrow is rejected with clear copy.
5. **Holds** — with account A holding a book, account B joins the queue; when A
   returns, the loan transfers to B automatically (book stays "Checked out").
6. **Ownership** — the Return button only ever appears on your own loans; crafted
   calls against another user's `loanId` throw `NotYourLoan` server-side.
7. **Admin gate** — as a member, `/admin` shows "Librarian access required" and
   any `admin.*` call is rejected (`Forbidden`) at the Convex function.
8. **Admin flows** — create/edit a book; delete is blocked while on loan;
   force-return promotes the hold queue; promote/demote members (self-demotion blocked).

Type-level verification:

```bash
npm run typecheck             # app
npx tsc --noEmit -p convex    # backend functions
npm run build                 # production build
```

---

## Running in production

### 1. Provision the prod Convex deployment

```bash
npx convex deploy   # first run creates the production deployment
```

Set the production env vars on the **prod** deployment (fresh secret — never reuse dev):

```bash
npx convex env set --prod BETTER_AUTH_SECRET=$(openssl rand -base64 32)
npx convex env set --prod SITE_URL https://library.lhproj.com
npx convex env set --prod GOOGLE_CLIENT_ID <prod-client-id>
npx convex env set --prod GOOGLE_CLIENT_SECRET <prod-client-secret>
npx convex env set --prod GOOGLE_CALENDAR_ID <public-calendar-id>
npx convex env set --prod GOOGLE_API_KEY <calendar-api-key>
```

After the first prod deploy, run `npx convex run events:sync --prod` once to populate
pickup events.

Create a **separate** Google OAuth client for prod (or add these to the existing one):

- Authorized JavaScript origin: your live app URL (custom domain or
  `https://lhp-library.<account>.workers.dev`) — must match prod `SITE_URL` exactly
- Authorized redirect URI: `<that same origin>/api/auth/callback/google`

### 2. Host the Next.js app (Cloudflare Workers)

The app deploys to **Cloudflare Workers** via `@opennextjs/cloudflare` (configured in
`wrangler.jsonc` + `open-next.config.ts`). One-time: `npx wrangler login`.

`NEXT_PUBLIC_*` variables are **inlined at build time**, so they must be present in the
environment that runs the build (shell, CI, or Workers Builds settings):

```
NEXT_PUBLIC_CONVEX_URL=https://<prod-deployment>.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://<prod-deployment>.convex.site
NEXT_PUBLIC_SITE_URL=https://library.lhproj.com
CONVEX_DEPLOY_KEY=<from Convex dashboard → Settings → Deploy keys, CI secret>
```

Deploy (backend first, then the worker built against it):

```bash
npx convex deploy --cmd 'npx opennextjs-cloudflare build'
npx opennextjs-cloudflare deploy
```

Or connect the GitHub repo to **Cloudflare Workers Builds** with build command
`npx convex deploy --cmd 'npx opennextjs-cloudflare build'` and deploy command
`npx opennextjs-cloudflare deploy`, with the four variables above set in the build
settings.

Local smoke test in the real Workers runtime (`workerd`): `npm run preview`.

**Custom domain:** Workers custom domains require the domain's DNS zone to be on
Cloudflare. If `lhproj.com` DNS stays elsewhere (it's currently on Wix), either delegate
a subdomain's NS records to a Cloudflare zone or ship on the `*.workers.dev` URL — and
make sure `SITE_URL` (Convex env) + `NEXT_PUBLIC_SITE_URL` + the Google OAuth JavaScript
origin all match whichever URL you choose.

**Size note:** Workers limit is 3 MiB compressed (free plan) / 10 MiB (paid). The
deploy output prints the bundle size — check it after dependency upgrades.

### 3. Seed + first librarian (once, against prod)

```bash
npx convex run seed:run --prod
# sign in once on the prod site, then:
npx convex run admin:bootstrapAdmin '{"email": "librarian@lhproj.com"}' --prod
```

### Production checklist

- [ ] `BETTER_AUTH_SECRET` is unique to prod
- [ ] `SITE_URL` (Convex env) and `NEXT_PUBLIC_SITE_URL` (host env) both match the real domain exactly
- [ ] Google prod OAuth client registers the live app origin + `<origin>/api/auth/callback/google` redirect URI
- [ ] Seed ran once; first librarian bootstrapped
- [ ] Verify: sign-in, borrow, return, hold, and admin gate on the live site

### Notes

- **Availability can't drift**: `books.status` is only ever written inside the
  borrow/return mutations, in the same transaction as the loan rows.
- **Authorization is enforced in Convex functions** (`convex/lib/authz.ts`);
  `middleware.ts` is UX-only redirect sugar.
- **Version pins**: `convex@1.42.3`, `better-auth@1.6.24`,
  `@convex-dev/better-auth@0.12.5`. The auth component is pre-1.0 — check its
  changelog and re-verify helper names before upgrading (see SETUP.md).

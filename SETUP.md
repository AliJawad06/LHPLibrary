# LHP Library — Setup

Next.js (App Router) + Convex + Better Auth (`@convex-dev/better-auth` 0.12.5, pinned) + Google OAuth.

## 1. Configure Convex (interactive — run yourself)

```bash
npx convex dev
```

- Log in (or choose an anonymous local deployment) and create the project.
- This regenerates `convex/_generated/` with real types (the checked-in stubs are
  build-time placeholders with identical shapes) and rewrites `.env.local` with your
  real `CONVEX_DEPLOYMENT` / `NEXT_PUBLIC_CONVEX_URL` / `NEXT_PUBLIC_CONVEX_SITE_URL`.
- Keep `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env.local`.

## 2. Auth env vars (on the Convex deployment, not .env.local)

```bash
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
npx convex env set SITE_URL http://localhost:3000
npx convex env set GOOGLE_CLIENT_ID <your-client-id>
npx convex env set GOOGLE_CLIENT_SECRET <your-client-secret>
```

### Google OAuth credentials

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Create OAuth client ID → Web application.
2. Authorized JavaScript origins: your app origin — `http://localhost:3000` (or whatever
   port you run on; must match `SITE_URL` exactly).
3. Authorized redirect URI: `<SITE_URL>/api/auth/callback/google` — the **app's own
   domain**, e.g. `http://localhost:3000/api/auth/callback/google`. Better Auth builds
   the redirect URI from its `baseURL` (= `SITE_URL`), and the callback flows through
   the Next `/api/auth` proxy so session cookies are set on the app domain. Do NOT
   register the `.convex.site` URL.
4. For prod, add the prod pair too (e.g. `https://lhp-library.<account>.workers.dev`
   origin + `.../api/auth/callback/google` redirect), or use a separate prod client.

## 2b. Pickup events (Google Calendar)

Borrowing requires choosing a pickup event, synced hourly from the org's **public**
Google Calendar:

1. In the same GCP project: **APIs & Services → Enable APIs → Google Calendar API**.
2. Create an **API key** (Credentials → Create credentials → API key). Restrict it to
   the Calendar API.
3. Find the Calendar ID: Google Calendar → calendar Settings → "Integrate calendar" →
   **Calendar ID** (looks like `…@group.calendar.google.com`). The calendar must be
   public ("Make available to public").
4. Set both on the deployment (repeat with `--prod` for production):

```bash
npx convex env set GOOGLE_CALENDAR_ID <calendar-id>
npx convex env set GOOGLE_API_KEY <api-key>
```

5. Initial sync (the hourly cron takes over afterwards):

```bash
npx convex run events:sync
```

With no synced events, borrowing is blocked with "contact the desk" copy by design.

## 3. Seed the catalog

```bash
npx convex run seed:run
```

Idempotent — 27 titles, all `available`.

## 4. Bootstrap the first librarian

Sign in once in the app (Google or email/password), then:

```bash
npx convex run admin:bootstrapAdmin '{"email": "you@example.com"}'
```

`bootstrapAdmin` is an `internalMutation` — callable only from the CLI/dashboard,
never from clients. After that, promote others from the in-app Members tab.

## 5. Run

```bash
npm run convex   # terminal 1 — Convex dev + codegen watch
npm run dev      # terminal 2 — Next.js on :3000
```

## Architecture notes

- **Enforcement lives in Convex functions** (`convex/lib/authz.ts` — `requireUser` /
  `requireAdmin`). `middleware.ts` only redirects for UX.
- **`books.status` is transactionally maintained** — written exclusively inside
  borrow/return/force-return mutations, so it can't drift from loan state.
- **Hold promotion** happens inside the same return mutation (v1 policy: fulfilling
  a hold auto-creates the next loan).
- **Role storage deviation from spec §4.1:** `role` lives in the app-owned
  `profiles` table, not as a Better Auth `additionalField` + JWT claim. Verified
  0.12.5 docs expose no stable server-side path to update an additionalField
  (needed for promote-user), and the JWT `definePayload` option isn't documented.
  Same enforcement point (Convex functions); client gating via the reactive
  `me.get` query, so role changes apply immediately instead of on token refresh.
- **Pinned exact**: `convex@1.42.3`, `better-auth@1.6.24`, `@convex-dev/better-auth@0.12.5`
  (§2 version note — verify helper names against docs before upgrading).

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
2. Authorized JavaScript origins: `http://localhost:3000`
3. Authorized redirect URI: `<NEXT_PUBLIC_CONVEX_SITE_URL>/api/auth/callback/google`
   (the `.convex.site` URL from `.env.local` — auth routes are served by Convex, not Next).

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

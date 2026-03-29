# SoloSuccess AI Platform

## Cursor Cloud specific instructions

### Architecture

Two services run in development:

| Service | Command | Port | Description |
|---------|---------|------|-------------|
| Next.js frontend | `npm run dev` (from repo root) | 3000 | App Router pages + API routes |
| Express API | `cd server && npm run dev` | 5000 | WebSockets, AI agents, Stripe hooks |

Both together: `npm run dev:all` (uses `concurrently`).

### Environment

- Copy `env.example` to `.env.local` at the **project root**. The Express server reads root `.env.local` automatically via `server/env-load.ts`.
- Required env vars for the app to boot: `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `JWT_SECRET`. Set `VALIDATE_ENV=false` to skip strict validation in dev.
- No separate `server/.env` needed; the root `.env.local` is shared.

### Dev commands (reference — see `package.json` scripts)

- **Lint**: `npm run lint`
- **Type-check (both)**: `npm run type-check`
- **Tests (Jest)**: `npm test`
- **Dev servers**: `npm run dev:all`

### Gotchas

- The ESLint config (`eslint.config.mjs`) is a flat config file using ESM; it imports `eslint-config-next` but the spread is commented out. Lint still passes on the repo as-is.
- `package-lock.json` is used (npm, not pnpm/yarn). Always use `npm install`.
- The server has its **own** `node_modules` and `package-lock.json` inside `server/`. Run `npm install` in both root and `server/`.
- Next.js dev uses `--webpack` flag (not Turbopack). Type-check for the web app can take ~50 seconds.
- Login/register requires a PostgreSQL `DATABASE_URL` (Neon recommended) to authenticate. Without it, the login form shows "Invalid credentials" (expected).
- The Express server starts in "API-only mode" without the frontend dist, which is normal for dev.
- Auth uses NextAuth v5 (beta) with a Credentials provider. The login form uses a server action (`authenticateAction`) that calls NextAuth `signIn('credentials', ...)`. Registration is implemented as a Next.js API route at `/api/register`, which **only** creates the user if you call it directly (e.g. from tests or external tools); in that case you still need to authenticate separately (or use the Express `/api/auth/signup` endpoint, which returns a JWT token directly).
- The `/register` page uses a server action that ultimately calls `/api/register` and, on success, immediately signs the user in via `signIn('credentials', ...)` and navigates to `/dashboard` in the happy path (no separate manual login screen); the "register-only" behavior without auto-login applies only when hitting `/api/register` directly.
- Password minimum is **8 characters** in the NextAuth credentials schema (the Express auth routes require only 6). Use 8+ to be safe.
- Many dashboard features (AI Squad, Competitor Intel, etc.) are gated behind subscription tiers. Free-tier users see upgrade prompts on those pages.

# Those Who Serve

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black)](#)
[![React](https://img.shields.io/badge/React-19.2.1-61dafb)](#)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518.x-43853d)](#)
[![pnpm](https://img.shields.io/badge/pnpm-10.17.0-orange)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Web application to assign and view those serving different roles within the 39th St Church of Christ congregation. Built with Next.js (App Router), NextAuth, Firebase, MUI, and React Email. Includes PWA support and schedule email notifications.

## Features
- Google sign-in with NextAuth and Firestore adapter
- Men management (add/edit/delete, roles, availability, photos)
- Auto-generated monthly schedules with conflict/availability awareness
- Finalization flow updates last-served timestamps and emails schedule assignments
- Calendar ICS/Google Calendar links
- PWA manifest + service worker for installability and offline caching
- Client-side cache for men/schedules to reduce refetches

## Tech Stack
- Next.js 16 (App Router), React 19
- TypeScript, ESLint, Vitest + Testing Library
- MUI + Emotion theming
- Firebase Admin/Firestore
- NextAuth (Google provider)
- React Email for notification templates

## Requirements
- Node.js 18+ (LTS recommended)
- pnpm 10+
- Google OAuth client (web) credentials
- Firebase project with Firestore

## Getting Started
```bash
pnpm install
pnpm dev
```
App runs on http://localhost:3000.

### Environment Variables
Create `.env.local` with:
```
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXTAUTH_URL=http://localhost:3000
SERVER_HOST=http://localhost:3000
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
GMAIL_SENDER=you@example.com
GMAIL_REFRESH_TOKEN_ID=gmail

# Firebase Admin (prefer env-based, not JSON in repo)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
Notes:
- `SERVER_HOST` is used by server actions to call API routes; set to the deployed origin in production.
- If you keep using an Admin SDK JSON file, ensure it is excluded from commits (see `.gitignore`), but prefer env vars above for Vercel.
- `GMAIL_REFRESH_TOKEN_ID` is optional if you read from the `accounts` collection.

### Scripts
- `pnpm dev` – run locally
- `pnpm build` / `pnpm start` – production build/serve
- `pnpm lint` – ESLint
- `pnpm test` – Vitest suite
- `pnpm tsc --noEmit` – type-check

## Testing & Quality
- Unit/Component tests live under `components/**/__tests__` and `lib/**/__tests__`.
- ESLint is configured for Next.js + TypeScript.
- Vitest uses jsdom (`setupTests.ts` for DOM mocks).

## PWA
- Manifest: `app/manifest.ts`
- Service worker: `public/sw.js`
- Icons/logo: `public/logo.png` (cached and used as the app icon)
- Registration happens in `components/pwa/ServiceWorkerRegister.tsx`

## Deployment (Vercel)
1) Set env vars in the Vercel project (see list above; production `NEXTAUTH_URL` must match your domain).
2) Add OAuth redirect URIs in Google console: `https://your-domain/api/auth/callback/google`.
3) Deploy via GitHub integration; Vercel will run `pnpm install`, `pnpm build`.
4) Optional: add `SERVER_HOST=https://your-domain` so server actions hit the correct origin.

## Releases (Semantic Versioning)
- Current version: **1.0.0**
- Follow SemVer: `MAJOR.MINOR.PATCH`.
- Maintain `CHANGELOG.md`: update `[Unreleased]`, then move entries into a new version block on release.
- Bump `package.json` version, tag the commit `vX.Y.Z`, and create a GitHub Release using `.github/release-template.md` with notes (features, fixes, breaking changes, deployment notes).

## Security Notes
- Do not commit secrets (OAuth, Firebase private key, refresh tokens). Use env vars in Vercel/CI and keep `those-who-serve-firebase-adminsdk.json` out of source control.
- Gmail sending relies on a refresh token stored in Firestore; restrict access to that collection.
- Service worker caches `/logo.png`, `/manifest.webmanifest`, and the root. API calls are network-first with cache fallback—adjust if you handle sensitive responses that should not be cached.
- Run `pnpm audit` periodically and before releases to catch dependency issues.

## Contributing
- Create a branch, keep tests/lint/type-check passing.
- Update `CHANGELOG.md` under `[Unreleased]` with notable changes.

## License
MIT

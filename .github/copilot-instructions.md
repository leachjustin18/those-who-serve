# Those Who Serve - Copilot Instructions

## Project Overview
**Those Who Serve** is a Next.js 16 (App Router) web app for managing deacon/servant schedules within a church congregation. Built with React 19, TypeScript, Firebase/Firestore, NextAuth (Google OAuth), and MUI.

## Architecture

### Core Layers
1. **Frontend** (`app/`, `components/`) - Next.js App Router with Server Components by default
2. **API Routes** (`app/api/`) - Typed REST endpoints handling data persistence and business logic
3. **Server Actions** (`lib/api/*`) - Server-side functions that fetch from API routes and wrap responses
4. **Client Cache** (`components/context/Cache.tsx`) - SessionCache for men, schedules, deacons; populated at protected layout render
5. **Auth** (`auth.ts`) - NextAuth + Firebase Firestore adapter; email authorization via `GET /api/authorized`
6. **Firebase** (`lib/firebase/admin.ts`) - Admin SDK initialization from env vars (project ID, client email, private key)

### Data Flow
- **Protected routes** (`app/(protected)/*`) render a Server Component layout that:
  - Checks session via `getUserSession()` from NextAuth
  - Fetches men/schedules/deacons via server actions (which call API routes)
  - Passes initial data to `CacheProvider` as hydration
- **Client components** consume cache from context and update via mutations to API routes
- **API routes** read/write Firestore directly and return JSON

### Key Integration Points
- **NextAuth Session**: Set in callbacks (auth.ts), persists as JWT in secure httpOnly cookie
- **Email Authorization**: `GET /api/authorized?email=...` aggregates Firestore `authorized` collection before sign-in succeeds
- **Gmail Sending**: Firestore `accounts` collection stores Google refresh tokens; `lib/helpers/googleGmail.ts` sends via Gmail API

## Conventions

### File Structure
- **Components**: `components/{feature}/` with `__tests__/` subdirs for tests and co-located component tests
- **Helpers/Utilities**: `lib/helpers/` and `lib/api/*` for server actions
- **API Routes**: Flat under `app/api/{resource}/route.ts` and `app/api/{resource}/[id]/route.ts`
- **Types**: Centralized in `types/index.ts` (TMan, TSchedule, TScheduleEntry, TDeacons, TFormInputs, etc.)

### Server Components vs Client
- Default to Server Components (marked `"use server"` implicitly in `app/` layouts and page files)
- Client components explicitly marked `"use client"` (Cache context, MUI ThemeRegistry, form handlers)
- Server actions in `lib/api/*` use `"use server"` directive and call API routes via `fetch(SERVER_HOST/api/...)`

### Testing
- Unit/component tests colocated: `__tests__/` subdirectory
- Use Vitest + React Testing Library (jsdom environment)
- See `setupTests.ts` for global mocks (ResizeObserver, matchMedia for MUI compatibility)
- Run `pnpm test` (run once) or `pnpm test:watch`

### Styling & Theme
- MUI + Emotion CSS-in-JS
- Global theme in `lib/theme/index.ts`; fonts in `lib/theme/fonts.ts`
- ThemeRegistry wraps app for SSR-safe Emotion cache (no hydration mismatch)
- ESLint: extends `eslint-config-next` for Next.js + TypeScript rules

## Critical Development Workflows

### Running Locally
```bash
pnpm install
pnpm dev  # http://localhost:3000
```

### Environment Setup
Copy `.env.local`:
```
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
NEXTAUTH_URL=http://localhost:3000
SERVER_HOST=http://localhost:3000  # server actions call this to reach API routes
AUTH_FIREBASE_PROJECT_ID=...
AUTH_FIREBASE_CLIENT_EMAIL=...
AUTH_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Common Tasks
- **Add new man/schedule field**: Update `types/index.ts` → add Firestore write in API route → update form or cache
- **Add new authorization email**: Insert doc into Firestore `authorized` collection
- **Schedule generation**: Logic in `lib/helpers/scheduling.ts` checks availability, role conflicts, last-served timestamps
- **Send emails**: Use `lib/helpers/googleGmail.ts` (requires Gmail refresh token from `accounts` collection)

### Build & Deploy
- `pnpm build` generates `.next/` static + server bundles
- `pnpm lint` checks ESLint rules
- `pnpm tsc --noEmit` verifies TypeScript
- Deploy to Vercel: set env vars, ensure Google OAuth redirect URI includes new domain

### Testing & Quality
- `pnpm test` runs Vitest suite once
- Tests live in `__tests__/` folders near source files
- Use `vi.mock()` and `vi.spyOn()` for mocking APIs/services

## Project-Specific Patterns

### Server Actions Pattern
Server actions wrap API calls and handle errors:
```typescript
"use server";
const host = process.env.SERVER_HOST;
export async function fetchMen(): Promise<TMan[]> {
  if (!host) throw new Error("SERVER_HOST is not defined");
  const res = await fetch(`${host}/api/men`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch men (status ${res.status})`);
  return res.json();
}
```

### API Route Pattern
API routes read/write Firestore and return JSON:
```typescript
export async function GET() {
  const snapshot = await db.collection("men").get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(data);
}
```

### Cache Context Usage
Protected layout hydrates cache; client components read and call mutation APIs:
```typescript
const { men, setMen } = useCacheContext();
// After POST/PUT to API route, update cache:
setMen(updatedMenList);
```

### Role Conflict System
`ROLE_OPTIONS` in `lib/constants/index.ts` defines roles with `conflictsWith` arrays. `lib/helpers/scheduling.ts` checks conflicts before assigning servants.

### Availability Checking
`TMan.unavailableDates` is an ISO string array (YYYY-MM-DD). Scheduling logic filters servants based on this list.

## Important Notes

- **Session Strategy**: JWT-based (not database sessions) for stateless scaling
- **Cache Invalidation**: Client cache cleared on browser close (SessionCache); no persistent local storage
- **Error Boundaries**: Consider adding ErrorBoundary components for graceful fallbacks
- **PWA**: Manifest + service worker cached; API calls are network-first with cache fallback
- **Secrets**: Never commit OAuth/Firebase keys; use env vars in Vercel and exclude `.json` Admin SDK files from git

## Key Files to Review
- `auth.ts` - NextAuth config, email authorization callback
- `app/(protected)/layout.tsx` - Initial data fetch, CacheProvider setup
- `lib/helpers/scheduling.ts` - Business logic for auto-schedule generation
- `components/context/Cache.tsx` - Client-side caching architecture
- `types/index.ts` - All major data shape definitions

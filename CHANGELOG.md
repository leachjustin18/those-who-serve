# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-09-12

### Added

- Finalized schedules can be emailed again from the calendar with the new **Email Those Who Serve** action and in-progress/result feedback.
- Email delivery failures are written server-side to an `error_logs` collection, which Firestore creates automatically on the first failure, with recipient, reason, subject, and schedule context for operator review.
- Tests cover manual schedule emailing, notification-route failure handling, recipient validation, transient retries, delivery concurrency, and error-log persistence.

### Changed

- Gmail notifications are sent as separate per-recipient messages, deduplicate and validate addresses, limit concurrent sends, retry transient failures once, and return structured success/failure results.
- Direct dependencies and development tooling were upgraded, including Next.js 16.3, React 19.3, React Email 6.9, Firebase Admin 13.10, Google APIs 180, Vitest 5, jsdom 30, and pnpm 12.4.1.
- pnpm native dependency build permissions now use the `allowBuilds` workspace configuration.

### Fixed

- Schedule notification emails now skip Worship In Song marker entries instead of treating them as recipients.
- Missing, invalid, rejected, and exhausted transient email deliveries are surfaced in the API response and persisted for troubleshooting.

## [1.0.2] - 2025-12-12

### Changed

- PWA manifest theme color now matches the in-app header so installed mobile experiences show a consistent status/toolbar tint.
- Login screen now displays the current app version (from package.json) so mobile installs can quickly confirm the deployed build.
- iOS viewport/meta tags now set the same light theme color and status-bar style for consistent appearance on Apple devices.
- Calendar header keeps navigation controls left/right on desktop, stacks cleanly on mobile, and Back to Today now behaves correctly.
- Worship In Song role is hidden from servant role selectors while remaining available for schedule marking.
- App header no longer clips the avatar/logo on narrow screens by hiding the brand icon on mobile and allowing overflow.

## [1.0.1] - 2025-12-12

### Added

- Calendar workspace rebuilt with dedicated components (header, day cards, edit modal, printable view, monthly roles) and worship-in-song controls.
- `useScheduleActions` hook plus tests to centralize generation, overrides, worship toggles, print extras, and finalize/notification flow validation.
- Richer schedule-notification email (React Email) with Google/ICS links and improved Gmail refresh-token persistence.
- `/api/deacons`, `fetchDeacons`, and CacheProvider support for serving printable extras; new CODEOWNERS + CI + auto-tag workflows.

### Changed

- Calendar page now fetches data via CacheProvider, validates print extras pre-finalize, toggles edit/print modes, and surfaces immediate finalize feedback.
- Printable schedule rendering moved into a reusable component powering the in-app print view; README refreshed with badges/stack overview.
- Service worker/middleware adjustments ensure protected routes bypass caches and server fetchers consistently use `SERVER_HOST`.
- PWA manifest theme color now matches the in-app header so installed mobile experiences show a consistent status/toolbar tint.

### Fixed

- Printable schedules collapse full-day worship entries properly and highlight role-level worship markings.
- Gmail notifications degrade gracefully with better refresh-token fallbacks, reducing finalize failures.
- Logout/auth caching issues resolved by clearing protected routes from caches and updating sign-out flows.

### Security

- Service worker now skips caching auth/protected routes to avoid serving stale user-specific content.
- API helpers validate ID path segments via a shared `assertSafeId` utility to prevent SSRF via crafted IDs.

## [1.0.0] - 2025-12-06

### Added

- Initial public release of Those Who Serve with authentication, scheduling, notifications, and PWA support.

---

**Release checklist (for future versions)**

- Update `CHANGELOG.md` under `[Unreleased]`, then move entries into a new version block.
- Bump version in `package.json`.
- Tag commit with `vX.Y.Z` and push tags.
- Create a GitHub Release using the template in `.github/release-template.md`.

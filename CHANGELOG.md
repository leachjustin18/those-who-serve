# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-11-18

[Compare 1.2.0...1.3.0](https://github.com/leachjustin18/those-who-serve/compare/v1.2.0...v1.3.0)

### Changed

- Re-architected application authorization so protected pages, API handlers, server-side requests, Gmail administration, and allowlist revocation share server-enforced access controls.
- Reworked service-worker caching around an explicit public-asset allowlist instead of attempting to exclude individual protected routes.

### Fixed

- Gmail sender authorization now derives its callback from the current application origin, preventing production configuration from accidentally routing it into NextAuth's sign-in callback.
- Deployment documentation now distinguishes the NextAuth sign-in callback from the dedicated Gmail sender callback.
- Server-side API requests now forward the signed-in user's session so protected data operations continue to work after API authorization is enforced.

### Security

- All men, deacon, communion-family, and schedule API operations now require both an authenticated session and a currently authorized email address.
- Schedule-notification delivery now rejects unauthenticated and removed users, preventing anonymous callers from sending production email.
- Sign-in authorization now checks Firestore directly on the server; the public endpoint no longer exposes or allows enumeration of authorized email addresses.
- Protected pages and Gmail sender reauthorization recheck the current allowlist, so removing an email revokes access without waiting for its existing session to expire.
- The service worker now caches only explicitly public install assets and removes older caches that could contain API responses or authenticated pages.

### Deployment Notes

- No new environment variables or data migrations are required.
- Existing browser service workers will activate the new cache policy and remove obsolete application caches after deployment.

## [1.2.0] - 2026-11-17

[Compare 1.2.0...1.1.0](https://github.com/leachjustin18/those-who-serve/compare/v1.2.0...v1.1.0)

### Added

- Authenticated operators can open **Error Logs** from the account menu and review the 100 most recent notification failures from Firestore.
- The Error Logs console groups notification and failure details, displays error types as status chips, and provides expandable structured context with responsive and empty states.
- The configured sender account can use **Reauthorize Gmail Sender** from the account menu to securely replace an expired, revoked, or incorrectly scoped Gmail credential.
- Regression tests cover the account-menu link, structured error values, and HTML/plain-text schedule email rendering.

### Changed

- Schedule notification templates now use native React email markup while retaining `@react-email/render` for HTML and plain-text output.
- Removed the deprecated `@react-email/components` package and its obsolete component dependencies.
- Normal Google application sign-in now requests identity access only; Gmail delivery authorization uses a separate, protected OAuth consent flow.

### Fixed

- Error Logs safely formats legacy and structured Firestore fields instead of passing objects directly to React children.
- Error Logs uses serializable MUI styles across the server/client component boundary, preventing the page from returning a 500 response.
- Gmail sender authorization is isolated from normal Google sign-in so unrelated account tokens cannot overwrite or replace the credential used for delivery.
- Gmail credentials are accepted only when Google confirms the `gmail.send` scope and the authorizing account matches the configured sender account.

### Security

- Several CWE-918: The web server receives a URL or similar request from an upstream component and retrieves the contents of this URL, but it does not sufficiently ensure that the request is being sent to the expected destination.
- Other dependencies and fixes.

## [1.1.0] - 2026-11-08

[Compare 1.0.3...1.1.0](https://github.com/leachjustin18/those-who-serve/compare/v1.0.3...v1.1.0)

### Added

- Communion families can be added, renamed, and deleted from a dedicated management page, with records stored in Firestore's `communion_families` collection.
- Schedule generation selects the least recently served communion family, prioritizes families that have never served, and breaks ties alphabetically. Planners can change the selection before finalizing.
- Finalizing a schedule records the selected family's last-served timestamp for future rotation.
- Tests cover family rotation and resolving family IDs while preserving legacy schedule text.

### Changed

- Communion families are available through shared page caching and app navigation.
- Printable schedules resolve family IDs to names and continue to display legacy free-text family values.

### Fixed

- Adding a family clears the name field while keeping the saved name in the success alert, allowing another family to be added immediately.
- Removed the duplicate back button that disappeared when the success alert closed. The permanent top back button is disabled while saving.

### Deployment Notes

- No new environment variables or data migration are required. The existing Firebase Admin configuration is used, and Firestore creates `communion_families` when the first family is added.
- Existing schedules retain their saved communion-family values. Add families through the management page to make them available for future scheduling.

## [1.0.3] - 2026-09-12

[Compare 1.0.2...1.0.3](https://github.com/leachjustin18/those-who-serve/compare/v1.0.2...v1.0.3)

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

[Compare 1.0.1...1.0.2](https://github.com/leachjustin18/those-who-serve/compare/v1.0.1...v1.0.2)

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

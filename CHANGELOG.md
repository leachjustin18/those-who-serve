# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### Fixed
- Printable schedules collapse full-day worship entries properly and highlight role-level worship markings.
- Gmail notifications degrade gracefully with better refresh-token fallbacks, reducing finalize failures.
- Logout/auth caching issues resolved by clearing protected routes from caches and updating sign-out flows.

### Security
- Service worker now skips caching auth/protected routes to avoid serving stale user-specific content.

## [1.0.0] - 2025-12-06
### Added
- Initial public release of Those Who Serve with authentication, scheduling, notifications, and PWA support.

---

**Release checklist (for future versions)**
- Update `CHANGELOG.md` under `[Unreleased]`, then move entries into a new version block.
- Bump version in `package.json`.
- Tag commit with `vX.Y.Z` and push tags.
- Create a GitHub Release using the template in `.github/release-template.md`.

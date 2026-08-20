# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow
[Semantic Versioning](https://semver.org/).

House rules for entries, learned from sibling projects:

- **Write for the reader, not the reviewer.** Entries are full sentences in
  user-facing language ("The app now remembers your color mode across
  restarts"), several sentences where the change deserves it, and they name
  the limits ("on web this applies only after the first reload"). No bare
  identifiers, no PR numbers in the body.
- New work lands under `[Unreleased]` in the matching category (`Added`,
  `Changed`, `Fixed`, `Removed`, `Tooling`); a release moves the block under
  a version heading with the date, in the same commit that bumps `version`
  in `app.config.ts`.

## [Unreleased]

### Added

- A complete store-publishing layer under `fastlane/`: the ios/android
  `listing` lanes push metadata, screenshots, and privacy declarations while
  EAS keeps owning the binaries, and a Pillow-based generator composes
  on-brand store screenshots from raw device captures. Everything ships as a
  guided placeholder skeleton — see `fastlane/PUBLISHING.md`.
- Every store deploy now leaves a permanent record in git: a
  `release/{platform}/{stamp}` branch cut before the build and an annotated
  outcome tag written after it. Failed and unfinished branches prune after
  30 days; tags and successful branches are kept for good. See
  `docs/release-branches.md`.
- New guides: releasing (`docs/releasing.md`), UI writing style
  (`docs/ui-writing-style.md`), decision records
  (`docs/decision-records.md`), and a hostable privacy-policy template
  (`docs/privacy-policy-template.md`).
- Generic utilities with tests: `toError`, `userFacingErrorMessage`,
  `formatDuration`, and the `withAlpha` theme helper for deriving
  translucent tiers from solid palette tokens.

### Changed

- The quality gate verifies that every image `app.config.ts` references
  exists and is non-empty, so a missing icon fails in seconds locally
  instead of minutes into an EAS cloud build.
- EAS build profiles are explicit per platform (internal APKs for
  development/preview, `m-medium` iOS builders), and Apple's
  export-compliance question is pre-answered in `app.config.ts`.

### Tooling

- PowerShell scripts are guarded by a test that keeps them pure ASCII (or
  UTF-8 with BOM), which Windows PowerShell 5.1 requires to parse them
  reliably.
- Jest makes `Animated.timing` synchronous, eliminating a CI-only worker
  crash caused by animation frames firing after environment teardown.

# Publishing the store listing

Everything the stores let you automate lives in this folder. Binaries are
built and submitted by **EAS** (`eas build` / `eas submit` — see
[`eas.json`](../eas.json), [`docs/releasing.md`](../docs/releasing.md), and the
deploy scripts in [`scripts/`](../scripts)); fastlane here pushes the **store
listing** — text, keywords, screenshots, and the privacy declarations — which
EAS does not manage.

Splitting the two means a copy edit or a new screenshot never requires a
build, and a build never blocks on marketing copy.

```
fastlane/
  Appfile                     app + team ids (placeholders — fill in)
  Fastfile                    ios/android `listing` lanes
  Gemfile                     pins fastlane
  privacy_details.json        Apple privacy label (default: DATA_NOT_COLLECTED)
  creative/render.py          regenerates all screenshots + feature graphic
  screenshots/en-US/          iOS screenshots (1320×2868)
  metadata/
    en-US/…                   iOS listing text + review info
    copyright.txt, *category  iOS app-level fields
    android/
      en-US/…                 Play listing text + changelog
      en-US/images/…          Play phone screenshots (1290×2796) + feature graphic (1024×500)
      data_safety.csv         Play Data Safety answers (default: no data collected)
```

Every text file ships with **placeholder content**. Nothing here is safe to
push to a store until you have rewritten it for your app — the checklist
below walks through each field.

## What's automated vs. console-only

| Area                               | Automated here                  | You do once in the console                                         |
| ---------------------------------- | ------------------------------- | ------------------------------------------------------------------ |
| Listing text, keywords, notes      | ✅ deliver / supply             | —                                                                  |
| Screenshots + feature graphic      | ✅ deliver / supply             | —                                                                  |
| Privacy label (Apple)              | ✅ `privacy_details.json`       | (first time) fill once, then `refresh_privacy_template`            |
| Data Safety (Google)               | ⚠️ answers in `data_safety.csv` | Export CSV for exact headers → import, or answer 3 questions in UI |
| Build upload + submit              | ✅ EAS (`eas submit`)           | —                                                                  |
| Pricing & availability             | ❌                              | App Store Connect / Play Console                                   |
| Bank, tax, agreements              | ❌                              | one-time account setup                                             |
| Content rating (IARC) / age rating | ❌                              | Play Console questionnaire; Apple age rating in ASC                |

## Field-by-field checklist (with store limits)

Apple rejects listings that exceed a limit, and truncates nothing — check
lengths before you push.

| File                                  | Store field       | Limit                                            |
| ------------------------------------- | ----------------- | ------------------------------------------------ |
| `metadata/en-US/name.txt`             | App name          | 30 characters                                    |
| `metadata/en-US/subtitle.txt`         | Subtitle          | 30 characters                                    |
| `metadata/en-US/keywords.txt`         | Keywords          | 100 characters total, comma-separated, no spaces |
| `metadata/en-US/promotional_text.txt` | Promotional text  | 170 characters; updatable **without** a review   |
| `metadata/en-US/description.txt`      | Description       | 4000 characters                                  |
| `metadata/en-US/release_notes.txt`    | What's New        | 4000 characters                                  |
| `metadata/android/en-US/title.txt`    | Play title        | 30 characters                                    |
| `…/short_description.txt`             | Short description | 80 characters                                    |
| `…/full_description.txt`              | Full description  | 4000 characters                                  |
| `…/changelogs/default.txt`            | Release notes     | 500 characters; `default.txt` = all versionCodes |

Image sizes (verified programmatically by `creative/render.py` on write —
a 1-pixel miss is an Apple rejection):

| Asset                  | Size      | Where                                             |
| ---------------------- | --------- | ------------------------------------------------- |
| iOS 6.9" screenshots   | 1320×2868 | `screenshots/en-US/`                              |
| Play phone screenshots | 1290×2796 | `metadata/android/en-US/images/phoneScreenshots/` |
| Play feature graphic   | 1024×500  | `metadata/android/en-US/images/featureGraphic/`   |

## Before you run anything — fill these in

1. **Identity**: `APP_ID` in the `Fastfile`, and everything in the `Appfile`
   (bundle id, Apple ID, team id). Keep the id in sync with
   `app.config.ts`.
2. **URLs**: `metadata/en-US/marketing_url.txt`, `support_url.txt`, and
   `privacy_url.txt` are placeholders. Host a privacy policy somewhere public
   (GitHub Pages works — start from
   [`docs/privacy-policy-template.md`](../docs/privacy-policy-template.md))
   and use that URL for `privacy_url.txt` and the Play privacy-policy field.
3. **Review information**: everything under
   `metadata/en-US/review_information/` — a real reachable phone number, and
   `notes.txt` rewritten as a genuine walkthrough. The three things reviewers
   reject over are undeclared logins, features they cannot find, and privacy
   claims that do not match observed behavior; `notes.txt` pre-answers all
   three.
4. **Categories**: `metadata/primary_category.txt` /
   `secondary_category.txt` use Apple's `MZGenre.*` enum form (e.g.
   `MZGenre.Music`, `MZGenre.Productivity`).
5. **Copy**: `description.txt` and `full_description.txt` are structural
   placeholders. Follow the shape (persona opening → how it works → FEATURES
   bullets → privacy sentence → call to action) and the rules in
   [`docs/ui-writing-style.md`](../docs/ui-writing-style.md).

## Credentials (never commit)

**iOS** — App Store Connect → Users and Access → Integrations → App Store
Connect API. Create a key with **App Manager** role, download the `.p8` once
(Apple only lets you download it once — store it in a password manager).

```bash
export ASC_KEY_ID="XXXXXXXXXX"
export ASC_ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export ASC_KEY_CONTENT="$(cat AuthKey_XXXXXXXXXX.p8)"   # raw contents, incl. BEGIN/END
export APPLE_ID="you@example.com"
```

**Android** — a Google Cloud service-account JSON granted access in Play
Console → Users and permissions. Point to it (the file name is git-ignored):

```bash
export SUPPLY_JSON_KEY="./pc-api-key.json"
```

## Run

```bash
cd fastlane && bundle install          # once

# iOS — push listing (metadata + screenshots + privacy label)
bundle exec fastlane ios listing
# …and submit the current build for review:
bundle exec fastlane ios listing submit:true

# Android — push Play listing (metadata + screenshots + feature graphic)
bundle exec fastlane android listing
```

`ios listing` runs `precheck` first to catch common rejection triggers
(placeholder text, other-platform mentions, broken URLs).

## Privacy declarations

The template defaults to a **zero-collection** posture: Apple's label says
`DATA_NOT_COLLECTED` and the Play Data Safety answers say "No". If your app
collects anything, update **both** together:

- **Apple** — fill the privacy questionnaire once in App Store Connect, then
  run `bundle exec fastlane ios refresh_privacy_template`. That downloads the
  exact enum JSON Apple stored into `privacy_details.json`, so every future
  push replays your real answers. (Apple's privacy enums are effectively
  undocumented; capturing them from a filled questionnaire is the reliable
  way to get them right.)
- **Google** — see the comment block in `metadata/android/data_safety.csv`.

## Regenerating screenshots

Put raw device captures in `assets/store-captures/`, map them to slides and
captions in `creative/render.py`, then:

```bash
cd fastlane/creative && python render.py mockups   # preview 2 slides first
cd fastlane/creative && python render.py full      # write all store assets
```

See the header of `render.py` for the full workflow.

## Keep the copy honest

Before writing or editing any listing text, list what the app actually does —
and what it does **not** do — and check every claim in the copy and the
screenshot captions against that list. A claim the reviewer cannot reproduce
is a rejection; a claim the user cannot reproduce is a one-star review.

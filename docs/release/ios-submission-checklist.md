# iOS Submission Release Checklist

Use this checklist before any App Store Connect submission.

## 1) Versioning / Build Number

- [ ] Confirm `expo.version` in `app.json` matches the intended release version.
- [ ] Bump iOS build number (`expo.ios.buildNumber`) for every submission.
- [ ] Confirm release notes match changes delivered in this build.

## 2) Metadata Checks (App Store Connect)

- [ ] Verify app name, subtitle, and description are current.
- [ ] Validate keywords and support/marketing URLs.
- [ ] Confirm screenshots are up to date for all required device classes.
- [ ] Verify promo text and “What’s New” notes are complete.

## 3) Permission Copy Review

- [ ] Review all iOS usage descriptions in `app.json` / native config.
- [ ] Ensure location permission messaging clearly states hunt-planning value.
- [ ] Ensure photo/media usage copy reflects hunt log media use.
- [ ] Confirm no stale or placeholder permission copy remains.

## 4) Privacy Labels

- [ ] Re-validate data collection declarations in App Store Connect.
- [ ] Confirm tracking settings and SDK behavior still match privacy labels.
- [ ] Verify Firebase/Auth/Analytics-related data types are accurately declared.
- [ ] Reconfirm privacy policy URL and in-app links are accessible.

## 5) QA Gate

- [ ] Run local release gate: `npm run qa`.
- [ ] Confirm CI gate passes on `main` or the target `release/*` branch.
- [ ] Archive test notes for auth, inventory, hunt log, and profile fallback smoke flows.

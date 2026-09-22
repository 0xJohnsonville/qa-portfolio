# Test Plan — TodoMVC E2E / Accessibility / API-Contract Suite

App under test: **TodoMVC** (https://demo.playwright.dev/todomvc/) — a small
CRUD app with filtering and storage persistence: small enough to cover
honestly, real enough to exercise every test layer a larger product needs.
API-contract layer targets **JSONPlaceholder** `/todos` as a stable public
contract fixture.

## 1. Scope

| Layer | File | Tests | What it proves |
|---|---|---|---|
| Functional (CRUD) | `tests/todo.spec.js` | 7 | The flows a user actually performs: add+count, complete, un-complete, edit, delete, bulk toggle, clear-completed |
| Filters + persistence | `tests/filters.spec.js` | 5 | View filtering and reload durability (incl. the filter-restore pin that falsified the originally assumed bug — §5) |
| Boundary / edge | `tests/edge.spec.js` | 6 | Empty/whitespace input, trimming, 500-char and unicode payloads, edit-to-empty semantics |
| Accessibility | `tests/a11y.spec.js` | 3 | axe-core scans (empty + populated states) gated at impact ≥ serious; input exposure/focus |
| API contract | `tests/api.spec.js` | 4 | Collection shape, item schema, out-of-range 404, POST echo + id assignment |
| Spec conformance | `tests/conformance.spec.js` | 1 | The deliberate TODO-1042 failure: classic reference build violates the spec's persistence requirement (§5) |

**26 tests**, run across three projects (Chromium, Firefox, Pixel-7 mobile
viewport) on every push and pull request, plus a nightly scheduled run to
catch app-under-test and API drift between pushes.

## 2. Exclusions — with rationale

- **Visual regression**: no screenshot baseline. The app under test is
  third-party and restyles without notice; pixel baselines would produce
  false alarms weekly and teach people to ignore red. Structure and behavior
  are asserted instead.
- **Performance/load**: out of scope — the app is a static demo behind a CDN;
  numbers would characterize the CDN, not the code.
- **axe rule `color-contrast`**: excluded from the a11y gate. The reference
  app's footer hint text fails contrast cosmetically; leaving the rule on
  drowns real regressions in a permanent known-red. Tracked as a known issue
  rather than gating.
- **Cross-venue sync / multi-tab**: TodoMVC's storage model makes concurrent
  tabs last-write-wins by design; asserting on it would test localStorage,
  not the app.

## 3. Risk table

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| App-under-test changes markup | Medium | Suite-wide false failures | POM with role/label/test-id locator priority; CSS only where unavoidable |
| Third-party API drift (JSONPlaceholder) | Low | API layer false failures | Nightly run catches drift within a day; contract asserts types, not incidental values |
| Flake from animation/timing | Low | Trust erosion | Web-first assertions only (`expect(locator)`), zero hard sleeps, retries disabled so flake surfaces instead of hiding |
| A stray `test.only` merged | Low | Silent coverage collapse | `forbidOnly` fails the build in CI |
| Browser-specific defect masked | Medium | Escaped defect | 3-project matrix with fail-fast disabled; failures isolated per browser |

## 4. Severity definitions

- **S1** — Data loss, crash, or security exposure; no workaround.
- **S2** — Core flow broken; workaround exists but is unreasonable.
- **S3** — Feature defect with reasonable workaround; state/UX correctness (TODO-1042 lives here).
- **S4** — Cosmetic; no functional impact.

## 5. The deliberate failure — and the falsified one

This suite was first specified expecting `filter selection survives reload`
to fail (an assumed filter-state bug, written before any browser had run the
tests). The first real execution **falsified that claim** — the primary app
restores the filter correctly, 3/3 browsers — so that test stands as a
passing regression pin, and the assumption is recorded, not erased: claims
made without execution are hypotheses.

The suite's one deliberate failure is now a **verified** defect:
`todos persist across reload (TodoMVC spec conformance)` in
`conformance.spec.js` fails against the classic reference build, which ships
no localStorage persistence at all — reload deletes the user's entire list
(TODO-1042, worked report in `BUG_REPORT_TEMPLATE.md`, reproduced 10/10 per
browser). The test asserts the spec's required behavior — green-by-skipping
would just hide a real defect.

Because that build is **third-party**, the assertion can never be made to
pass from inside this repo. Leaving it to fail the build conflated two
different signals — "the known upstream defect is still there" and
"something in this suite broke" — and produced a standing red build, which
is indistinguishable from neglect and trains readers to ignore CI. The test
is therefore marked `test.fail()` at its definition: it still executes on
every run and still asserts the spec, but a failure is recorded as
**expected** and the suite exits 0.

This is stricter than a raw red build, not laxer. The alert is inverted: if
upstream ever ships persistence, the assertion passes, Playwright reports
"expected to fail but passed", and **the build goes red** — which is exactly
when a human is needed, to close TODO-1042 and delete the test. Under the
old arrangement an upstream fix would have silently turned the suite green
and the bug report would have quietly gone stale.

Expected suite result: **26 tests per project — 25 passing, 1 expected
failure, exit code 0**.

## 6. Entry / exit criteria

**Entry**: `npm ci && npx playwright install --with-deps` completes; app URL
reachable; suite runs headless.

**Exit (per change)**: per project, 25 passing + 1 expected TODO-1042
failure and a **zero exit code**; zero unexpected failures and zero
unexpected passes; no `test.only` in the diff;
a11y gate (impact ≥ serious, contrast excluded) empty; API contract intact.
Any unexpected red blocks merge until root-caused — fix the test only if the
test was wrong, fix the code if the code was.

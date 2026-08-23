# qa-portfolio — Playwright E2E, Accessibility & API-Contract Suite

A complete, runnable QA portfolio piece: **26 automated tests** against
TodoMVC (functional, boundary, accessibility, API-contract), a cross-browser
CI matrix, and a written test plan + worked defect report.

> **One test fails on purpose.** The spec-conformance test in
> `tests/conformance.spec.js` documents **TODO-1042** — a real, verified
> data-loss defect in the classic TodoMVC reference build: reload deletes the
> entire todo list (the TodoMVC spec requires localStorage persistence). The
> test asserts the spec's required behavior and stays red until the build
> conforms: a living bug report. Bonus honesty: the bug this suite was
> *originally* written to document turned out not to exist — the first real
> browser run falsified it, and that record is kept in the test plan.
> Details: [docs/BUG_REPORT_TEMPLATE.md](docs/BUG_REPORT_TEMPLATE.md).
> Expected result: **25 pass / 1 fail per browser project.**

## Run it

```bash
npm ci
npx playwright install --with-deps
npm test                 # all three projects
npm run test:chromium    # single project
npm run report           # open the HTML report
```

## What's demonstrated

- **Page Object Model** with a strict locator priority — role → label → text
  → test-id → CSS — so visual refactors don't produce false failures. Every
  CSS fallback is commented with why nothing better exists.
- **Cross-browser matrix** (Chromium, Firefox, Pixel-7 mobile viewport) with
  fail-fast disabled, so browser-specific defects are isolated, not masked.
- **CI discipline**: runs on push, PR, and a nightly cron (catches
  app/API drift between pushes); `forbidOnly` makes a stray `test.only` fail
  the build; traces + video are captured **on failure only**.
- **Accessibility as a gate, not a gesture**: axe-core scans on empty and
  populated states, gated at impact ≥ serious, with one documented exclusion
  (rationale in the test plan — an actionable gate beats a noisy one).
- **API-contract testing**: response *shape* asserted (types, schema, error
  semantics), not incidental values.
- **Written artifacts**: [test plan](docs/TEST_PLAN.md) with scope,
  exclusions-with-rationale, risk table, severity definitions, entry/exit
  criteria; [bug report template](docs/BUG_REPORT_TEMPLATE.md) with the
  TODO-1042 worked example.

## Layout

```
pages/todo-page.js        # Page Object (locator priority doctrine lives here)
tests/todo.spec.js        # functional CRUD          (8)
tests/filters.spec.js     # filters + persistence    (5, incl. TODO-1042)
tests/edge.spec.js        # boundary / edge          (6)
tests/a11y.spec.js        # axe-core accessibility   (3)
tests/api.spec.js         # API contract             (4)
docs/TEST_PLAN.md
docs/BUG_REPORT_TEMPLATE.md
.github/workflows/tests.yml
```

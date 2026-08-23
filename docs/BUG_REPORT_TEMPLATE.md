# Bug Report Template

Copy the template, fill every field. A report that can't be reproduced from
its own steps is a rumor, not a report. The worked example below (TODO-1042)
is a real defect in the app under test, kept open on purpose — the suite's
`filter selection survives reload` test fails against it by design and acts
as the living regression check.

---

## Template

| Field | Value |
|---|---|
| **ID** | PROJECT-NNNN |
| **Title** | One sentence: *what breaks, where, under what condition* |
| **Severity** | S1–S4 (definitions in TEST_PLAN.md) |
| **Priority** | P1–P3 (business urgency — distinct from severity) |
| **Environment** | App version/URL, browser + version, viewport, OS |
| **Preconditions** | State required before the steps |

**Steps to reproduce** (numbered, minimal — remove any step the repro survives without)

**Expected result** (cite the requirement or convention that makes it "expected")

**Actual result** (what happens, verbatim; attach trace/video/screenshot)

**Reproducibility** (n of m attempts; note any flake pattern)

**Notes / suspected cause** (optional — observations, not guesses dressed as facts)

---

## Worked example — TODO-1042

*Provenance note (part of the QA story on purpose): this suite was first
specified with a DIFFERENT assumed defect — "filter selection is lost on
reload" in the Playwright TodoMVC build — written before any browser had
ever executed the tests. The first real run **falsified** that claim (the
filter is correctly restored from the URL hash, 3/3 browsers). Probing the
classic reference build instead surfaced the genuine defect below. Claims
made without execution are hypotheses; this one didn't survive contact.*

| Field | Value |
|---|---|
| **ID** | TODO-1042 |
| **Title** | Todos are not persisted across reload — the entire list is lost, violating the TodoMVC app spec's localStorage requirement |
| **Severity** | S1 — user data loss (the spec's own definition of the persistence requirement makes this core, not cosmetic) |
| **Priority** | P2 — reference implementations teach patterns; a non-persisting reference build propagates the defect into derived apps |
| **Environment** | TodoMVC classic React build (todomvc.com/examples/react/dist/), Chromium 140 / Firefox / Pixel-7 viewport, WSL2 Ubuntu |
| **Preconditions** | None (fresh page) |

**Steps to reproduce**

1. Add todos "active task" and "finished task"; mark "finished task" complete.
2. Observe: 2 items listed, count reads "1 item left".
3. Reload the page.

**Expected result**

Both todos are restored. The TodoMVC application specification states:
"Your app should dynamically persist the todos to localStorage." Sibling
builds (e.g. the Playwright TodoMVC fork) do exactly this.

**Actual result**

The list is empty and the count reads **"0 items left!"** — all todo data
is gone. (With a filter hash in the URL, the footer/filter bar doesn't
render at all, since the app treats it as an empty state.)

**Reproducibility** 10/10, all three browser projects.

**Notes / suspected cause** No write to localStorage is observable during
add/toggle (Application → Local Storage stays empty), so this is absent
persistence, not failed rehydration. The regression check lives in
`tests/conformance.spec.js` and stays red until the build conforms.

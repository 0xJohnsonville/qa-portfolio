// Spec-conformance check against the CLASSIC TodoMVC reference build
// (todomvc.com/examples/react/dist) — and the suite's one DELIBERATE
// failure. TodoMVC's app specification requires: "Your app should
// dynamically persist the todos to localStorage." This build doesn't:
// reload and every todo is gone ("0 items left!"). Verified 10/10 across
// browsers — the worked defect report is docs/BUG_REPORT_TEMPLATE.md
// (TODO-1042). The test asserts the SPEC'S required behavior and stays red
// until the app conforms: a living bug report, removed when fixed.
//
// WHY test.fail() RATHER THAN A RAW RED BUILD:
// The defect is in a third-party build we do not own and cannot patch, so
// this assertion can never be made to pass from inside this repo. Letting it
// fail the build conflated two very different signals — "a known, documented,
// upstream defect is still present" and "something in this suite broke" —
// and left CI permanently red, which trains everyone to ignore it.
// test.fail() keeps the test EXECUTING every run and inverts the alert:
//   - assertion still fails  -> expected failure, build stays green
//   - assertion starts passing -> Playwright FAILS the run ("expected to fail
//     but passed"), which is precisely when a human is needed: upstream has
//     shipped persistence and TODO-1042 should be closed and this file deleted.
// This is stricter than the old behavior, not laxer: previously an upstream
// fix would have silently turned the suite green and nobody would have
// noticed the bug report had gone stale.
//
// Locators here are CSS-tier by necessity: this third-party build ships no
// test ids and unlabeled controls — documented exception to the POM
// locator-priority doctrine.
const { test, expect } = require('@playwright/test');

const CLASSIC = 'https://todomvc.com/examples/react/dist/';

test('todos persist across reload (TodoMVC spec conformance)', async ({ page }) => {
  test.fail(
    true,
    'TODO-1042: the classic TodoMVC build performs no localStorage write at all, ' +
    'so reload discards every todo. Upstream defect, not ours to fix — see ' +
    'docs/BUG_REPORT_TEMPLATE.md. If this test starts PASSING, upstream has ' +
    'conformed: close TODO-1042 and delete this file.'
  );

  await page.goto(CLASSIC);
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('active task');
  await input.press('Enter');
  await input.fill('finished task');
  await input.press('Enter');
  await page.locator('.todo-list li', { hasText: 'finished task' })
    .locator('.toggle').check();
  await expect(page.locator('.todo-list li')).toHaveCount(2);

  await page.reload();

  // Spec-required behavior: the two todos come back from localStorage.
  // Actual (TODO-1042): the list is empty and the count reads "0 items left!"
  await expect(page.locator('.todo-list li')).toHaveCount(2);
  await expect(page.locator('.todo-list li', { hasText: 'active task' })).toBeVisible();
});

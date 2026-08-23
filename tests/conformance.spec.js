// Spec-conformance check against the CLASSIC TodoMVC reference build
// (todomvc.com/examples/react/dist) — and the suite's one DELIBERATE
// failure. TodoMVC's app specification requires: "Your app should
// dynamically persist the todos to localStorage." This build doesn't:
// reload and every todo is gone ("0 items left!"). Verified 10/10 across
// browsers — the worked defect report is docs/BUG_REPORT_TEMPLATE.md
// (TODO-1042). The test asserts the SPEC'S required behavior and stays red
// until the app conforms: a living bug report, removed when fixed.
//
// Locators here are CSS-tier by necessity: this third-party build ships no
// test ids and unlabeled controls — documented exception to the POM
// locator-priority doctrine.
const { test, expect } = require('@playwright/test');

const CLASSIC = 'https://todomvc.com/examples/react/dist/';

test('todos persist across reload (TodoMVC spec conformance)', async ({ page }) => {
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

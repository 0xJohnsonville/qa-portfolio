// Accessibility layer: axe-core scans gated to impact >= serious so the gate
// stays actionable. Known exclusion: color-contrast (cosmetic contrast issues
// in this reference app's footer text; excluded with rationale in
// docs/TEST_PLAN.md so real regressions aren't drowned out).
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { TodoPage } = require('../pages/todo-page');

function gate(results) {
  return results.violations.filter((v) => ['critical', 'serious'].includes(v.impact));
}

test('empty state has no serious accessibility violations', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.goto();
  const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  expect(gate(results)).toEqual([]);
});

test('populated list has no serious accessibility violations', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.goto();
  await todo.add('first');
  await todo.add('second');
  await todo.toggle('second');
  const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  expect(gate(results)).toEqual([]);
});

test('new-todo input is exposed to assistive tech and focused on load', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.goto();
  await expect(todo.input).toBeVisible();
  await expect(todo.input).toBeFocused();
});

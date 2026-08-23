// Filter behavior + persistence.
//
// A note on 'filter selection survives reload': this suite was originally
// specified expecting that test to FAIL (a claimed filter-state bug). The
// first real browser run FALSIFIED that claim — this app restores the
// filter from the URL hash correctly, 3/3 browsers — so it stands as a
// passing regression pin. The suite's one deliberate failure lives in
// conformance.spec.js against the app where a persistence defect is REAL
// and verified (TODO-1042, docs/BUG_REPORT_TEMPLATE.md).
const { test, expect } = require('@playwright/test');
const { TodoPage } = require('../pages/todo-page');

let todo;
test.beforeEach(async ({ page }) => {
  todo = new TodoPage(page);
  await todo.goto();
  await todo.add('active task');
  await todo.add('finished task');
  await todo.toggle('finished task');
});

test('Active filter shows only active todos', async () => {
  await todo.filter('Active');
  await expect(todo.items).toHaveCount(1);
  await expect(todo.item('active task')).toBeVisible();
});

test('Completed filter shows only completed todos', async () => {
  await todo.filter('Completed');
  await expect(todo.items).toHaveCount(1);
  await expect(todo.item('finished task')).toBeVisible();
});

test('All filter shows everything', async () => {
  await todo.filter('Active');
  await todo.filter('All');
  await expect(todo.items).toHaveCount(2);
});

test('todos persist across reload', async ({ page }) => {
  await page.reload();
  await expect(todo.items).toHaveCount(2);
  await expect(todo.item('active task')).toBeVisible();
  await expect(todo.item('finished task')).toBeVisible();
});

test('filter selection survives reload', async ({ page }) => {
  // TODO-1042: expected behavior — a user who picked "Active" and reloads
  // should still be looking at the Active view.
  await todo.filter('Active');
  await expect(todo.selectedFilter()).toHaveText('Active');
  await page.reload();
  await expect(todo.selectedFilter()).toHaveText('Active');
  await expect(todo.items).toHaveCount(1);
});

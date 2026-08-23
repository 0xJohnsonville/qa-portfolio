// Functional layer: core CRUD flows a user actually performs.
const { test, expect } = require('@playwright/test');
const { TodoPage } = require('../pages/todo-page');

let todo;
test.beforeEach(async ({ page }) => {
  todo = new TodoPage(page);
  await todo.goto();
});

test('adds multiple todos and counts them', async () => {
  await todo.add('one');
  await todo.add('two');
  await todo.add('three');
  await expect(todo.items).toHaveCount(3);
  await expect(todo.count).toContainText('3');
});

test('completes a todo', async () => {
  await todo.add('walk dog');
  await todo.toggle('walk dog');
  await expect(todo.item('walk dog').getByRole('checkbox')).toBeChecked();
  await expect(todo.count).toContainText('0');
});

test('un-completes a completed todo', async () => {
  await todo.add('walk dog');
  await todo.toggle('walk dog');
  await todo.untoggle('walk dog');
  await expect(todo.item('walk dog').getByRole('checkbox')).not.toBeChecked();
  await expect(todo.count).toContainText('1');
});

test('edits a todo with double-click', async () => {
  await todo.add('originl');
  await todo.edit('originl', 'original, fixed');
  await expect(todo.item('original, fixed')).toBeVisible();
  await expect(todo.items).toHaveCount(1);
});

test('deletes a todo', async () => {
  await todo.add('temp');
  await todo.remove('temp');
  await expect(todo.items).toHaveCount(0);
});

test('clear-completed removes only completed todos', async () => {
  await todo.add('keep me');
  await todo.add('done with this');
  await todo.toggle('done with this');
  await todo.clearCompleted.click();
  await expect(todo.items).toHaveCount(1);
  await expect(todo.item('keep me')).toBeVisible();
});

test('toggle-all marks every todo complete', async () => {
  await todo.add('a');
  await todo.add('b');
  await todo.toggleAll.check();
  await expect(todo.count).toContainText('0');
  for (const title of ['a', 'b']) {
    await expect(todo.item(title).getByRole('checkbox')).toBeChecked();
  }
});

// Boundary / edge layer: inputs users don't intend but apps must survive.
const { test, expect } = require('@playwright/test');
const { TodoPage } = require('../pages/todo-page');

let todo;
test.beforeEach(async ({ page }) => {
  todo = new TodoPage(page);
  await todo.goto();
});

test('empty input is not added', async () => {
  await todo.input.press('Enter');
  await expect(todo.items).toHaveCount(0);
});

test('whitespace-only input is not added', async () => {
  await todo.add('   ');
  await expect(todo.items).toHaveCount(0);
});

test('leading and trailing whitespace is trimmed on add', async () => {
  await todo.add('   buy milk   ');
  await expect(todo.items).toHaveCount(1);
  await expect(todo.items.first().getByTestId('todo-title')).toHaveText('buy milk');
});

test('a 500-character todo is stored intact', async () => {
  const long = 'x'.repeat(500);
  await todo.add(long);
  await expect(todo.items).toHaveCount(1);
  await expect(todo.items.first().getByTestId('todo-title')).toHaveText(long);
});

test('unicode and emoji todos render intact', async () => {
  const text = '🚀 déjà vu — 测试 ✓';
  await todo.add(text);
  await expect(todo.item(text)).toBeVisible();
});

test('editing a todo to an empty string deletes it', async () => {
  await todo.add('soon gone');
  await todo.edit('soon gone', '');
  await expect(todo.items).toHaveCount(0);
});

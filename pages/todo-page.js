// Page Object for TodoMVC (https://demo.playwright.dev/todomvc/).
//
// Locator priority, applied strictly: role -> label -> text -> test-id -> CSS.
// CSS appears only where the app exposes nothing better (the destroy button
// and the filter selection state), so visual refactors don't produce false
// failures — and each CSS use is commented with why it fell through the tiers.

class TodoPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.input = page.getByPlaceholder('What needs to be done?'); // label tier
    this.items = page.getByTestId('todo-item');                   // test-id tier
    this.count = page.getByTestId('todo-count');                  // test-id tier
    this.toggleAll = page.getByLabel('Mark all as complete');     // label tier
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
  }

  async goto() {
    await this.page.goto('.');
  }

  /** The list item whose title matches exactly. */
  item(title) {
    return this.items.filter({ hasText: title });
  }

  async add(text) {
    await this.input.fill(text);
    await this.input.press('Enter');
  }

  async toggle(title) {
    await this.item(title).getByRole('checkbox').check();
  }

  async untoggle(title) {
    await this.item(title).getByRole('checkbox').uncheck();
  }

  async remove(title) {
    const item = this.item(title);
    await item.hover();
    // CSS tier: the destroy button renders with no role name, label, or
    // test id in this app — nothing higher-priority to hook.
    await item.locator('.destroy').click();
  }

  async edit(title, newText) {
    const item = this.item(title);
    await item.getByTestId('todo-title').dblclick();
    const box = item.getByRole('textbox', { name: 'Edit' });
    await box.fill(newText);
    await box.press('Enter');
  }

  async filter(name) {
    await this.page.getByRole('link', { name, exact: true }).click();
  }

  /** The currently highlighted filter link. CSS tier: selection is exposed
   *  only as a class on the anchor — no aria-current in this app. */
  selectedFilter() {
    return this.page.locator('.filters .selected');
  }
}

module.exports = { TodoPage };

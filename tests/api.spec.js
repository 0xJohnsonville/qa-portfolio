// API-contract layer: the shape consumers depend on, not just status codes.
// Target: JSONPlaceholder's /todos resource (stable public fixture API).
const { test, expect } = require('@playwright/test');

const API = 'https://jsonplaceholder.typicode.com';

test('GET /todos returns the full collection with a stable shape', async ({ request }) => {
  const res = await request.get(`${API}/todos`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(200);
  const first = body[0];
  expect(typeof first.id).toBe('number');
  expect(typeof first.title).toBe('string');
});

test('GET /todos/1 honors the documented schema contract', async ({ request }) => {
  const res = await request.get(`${API}/todos/1`);
  expect(res.status()).toBe(200);
  const todo = await res.json();
  expect(typeof todo.userId).toBe('number');
  expect(typeof todo.id).toBe('number');
  expect(typeof todo.title).toBe('string');
  expect(typeof todo.completed).toBe('boolean');
  expect(todo.id).toBe(1);
});

test('GET /todos/0 (out-of-range id) returns 404, not a soft error', async ({ request }) => {
  const res = await request.get(`${API}/todos/0`);
  expect(res.status()).toBe(404);
});

test('POST /todos creates: echoes payload and assigns an id', async ({ request }) => {
  const payload = { userId: 7, title: 'write the contract test', completed: false };
  const res = await request.post(`${API}/todos`, { data: payload });
  expect(res.status()).toBe(201);
  const created = await res.json();
  expect(created).toMatchObject(payload);
  expect(typeof created.id).toBe('number');
});

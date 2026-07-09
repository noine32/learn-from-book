import { expect, test } from 'vitest';
import { deepEqual } from './impl.ts';

test('deepEqual compares nested structures by value', () => {
  expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
  expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
  expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  expect(deepEqual(1, 1)).toBe(true);
});

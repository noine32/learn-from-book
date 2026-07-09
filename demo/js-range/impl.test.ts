import { expect, test } from 'vitest';
import { range } from './impl.ts';

test('range builds inclusive numeric sequences with step', () => {
  expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
  expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8, 10]);
  expect(range(5, 1, -1)).toEqual([5, 4, 3, 2, 1]);
});

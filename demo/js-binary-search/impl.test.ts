import { expect, test } from 'vitest';
import { binarySearch } from './impl.ts';

test('binarySearch returns the index or -1', () => {
  expect(binarySearch([1, 3, 5, 7, 9], 7)).toBe(3);
  expect(binarySearch([1, 3, 5, 7, 9], 1)).toBe(0);
  expect(binarySearch([1, 3, 5, 7, 9], 4)).toBe(-1);
  expect(binarySearch([], 1)).toBe(-1);
});

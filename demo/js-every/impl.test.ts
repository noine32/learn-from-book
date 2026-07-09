import { expect, test } from 'vitest';
import { every } from './impl.ts';

test('every returns true only when all elements pass', () => {
  expect(every([2, 4, 6], (n) => n % 2 === 0)).toBe(true);
  expect(every([2, 3, 6], (n) => n % 2 === 0)).toBe(false);
  expect(every<number>([], () => false)).toBe(true); // vacuous truth
});

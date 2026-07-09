import { expect, test } from 'vitest';
import { gcd } from './impl.ts';

test('gcd computes the greatest common divisor (Euclid)', () => {
  expect(gcd(12, 8)).toBe(4);
  expect(gcd(17, 5)).toBe(1);
  expect(gcd(0, 9)).toBe(9);
  expect(gcd(-12, 8)).toBe(4);
});

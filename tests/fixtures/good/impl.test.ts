import { expect, test } from 'vitest';
import { reverseString } from './impl.ts';

test('reverses a string', () => {
  expect(reverseString('abc')).toBe('cba');
  expect(reverseString('')).toBe('');
});

import { expect, test } from 'vitest';
import { isPalindrome } from './impl.ts';

test('isPalindrome ignores case and non-alphanumerics', () => {
  expect(isPalindrome('A man, a plan, a canal: Panama')).toBe(true);
  expect(isPalindrome('racecar')).toBe(true);
  expect(isPalindrome('hello')).toBe(false);
  expect(isPalindrome('')).toBe(true);
});

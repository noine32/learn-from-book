import { expect, test } from 'vitest';
import { memoize } from './impl.ts';

test('memoize caches results per argument', () => {
  let calls = 0;
  const slow = (n: number) => {
    calls++;
    return n * 2;
  };
  const fast = memoize(slow);
  expect(fast(3)).toBe(6);
  expect(fast(3)).toBe(6); // served from cache
  expect(calls).toBe(1);
  expect(fast(4)).toBe(8);
  expect(calls).toBe(2);
});

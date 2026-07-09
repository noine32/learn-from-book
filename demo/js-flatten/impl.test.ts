import { expect, test } from 'vitest';
import { flatten } from './impl.ts';

test('flatten concatenates one level of nested arrays', () => {
  expect(flatten([[1], [2, 3], []])).toEqual([1, 2, 3]);
  expect(flatten([['a'], ['b', 'c']])).toEqual(['a', 'b', 'c']);
});

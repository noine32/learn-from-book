import { expect, test } from 'vitest';

// 自作自演テスト: 実装(impl.ts)を import も使用もせず、ハードコード値を assert するだけ。
// §6 のハーネスはこれを verified から弾かなければならない。
test('tautological', () => {
  expect('cba').toBe('cba');
});

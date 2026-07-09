import { defineConfig } from 'vitest/config';

// verify ハーネスが1技術のテスト（<dir>/impl.test.ts）を隔離実行するための config。
// 本スイート(vitest.config.ts)とは別に、対象ファイルだけを filter で走らせる。
export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**'],
  },
});

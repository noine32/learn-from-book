import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // fixtures はハーネスが専用 config で個別実行するため、本スイートからは除外する
    exclude: ['**/node_modules/**', 'tests/fixtures/**'],
  },
});

import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runNodeTechnique } from '../../src/adapters/node.ts';
import type { Technique } from '../../src/types.ts';

const here = dirname(fileURLToPath(import.meta.url));
const demoDir = (name: string) => join(here, '..', '..', 'demo', name);
const tech = (name: string): Technique => ({
  id: name,
  name,
  source: 'demo',
  claim: name,
  experimentIdea: '',
  runtime: 'node',
  dependsOn: [],
  status: 'experimenting',
});

// Eloquent JavaScript の概念（higher-order functions 等）を自作実装で再現し、
// §6 検証（トートロジー弾き含む）を通ることを確認する。
describe('Eloquent JavaScript concept demos (node runtime)', () => {
  const names = [
    'js-every',
    'js-flatten',
    'js-range',
    'js-deep-equal',
    'js-binary-search',
    'js-gcd',
    'js-is-palindrome',
    'js-memoize',
  ];
  for (const name of names) {
    it(`verifies ${name} end-to-end`, async () => {
      const { result } = await runNodeTechnique(demoDir(name), tech(name));
      expect(result.verified).toBe(true);
      expect(result.negativeSanityHeld).toBe(true);
    }, 30000);
  }
});

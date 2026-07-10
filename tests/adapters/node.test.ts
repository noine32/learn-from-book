import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runNodeTechnique } from '../../src/adapters/node.ts';
import type { Technique } from '../../src/types.ts';

const here = dirname(fileURLToPath(import.meta.url));
const demo = join(here, '..', '..', 'demo', 'debounce');

const t: Technique = {
  id: 'debounce',
  name: 'debounce',
  source: 'demo',
  claim: 'once after wait',
  experimentIdea: 'fake timers',
  runtime: 'node',
  dependsOn: [],
  status: 'experimenting',
};

describe('runNodeTechnique', () => {
  it('verifies the debounce demo and returns nextStatus=verified', async () => {
    const { result, nextStatus } = await runNodeTechnique(demo, t);
    expect(result.verified).toBe(true);
    expect(nextStatus).toBe('verified');
  }, 30000);
});

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const runPs1 = join(here, '..', '..', 'src', 'adapters', 'run.ps1');

// Windows PowerShell 5.1 misreads non-ASCII bytes in a .ps1 (no BOM), which has
// repeatedly corrupted this script. Guard against any non-ASCII bytes creeping in.
describe('run.ps1 encoding guard', () => {
  it('contains only ASCII bytes', () => {
    const src = readFileSync(runPs1, 'latin1');
    const nonAscii = [...src]
      .map((ch, i) => ({ ch, i }))
      .filter((x) => x.ch.charCodeAt(0) > 127);
    expect(nonAscii).toEqual([]);
  });
});

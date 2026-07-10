import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { verifyGoTechnique, countGoAsserts, goPackage, goStub } from '../../src/adapters/go.ts';

const here = dirname(fileURLToPath(import.meta.url));
const demoDir = (name: string) => join(here, '..', '..', 'demo', name);

function goAvailable(): boolean {
  try {
    execFileSync('go', ['version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
const hasGo = goAvailable();

describe('go static checks', () => {
  it('countGoAsserts / goPackage / goStub', () => {
    expect(countGoAsserts('t.Errorf("x"); t.Fatal("y")')).toBe(2);
    expect(goPackage('package technique\n')).toBe('technique');
    const stub = goStub('package technique\n\nfunc Foo(a int) int {\n\treturn a\n}\n');
    expect(stub).toContain('panic("MUTATED")');
    expect(stub).not.toContain('return a');
  });
});

describe.runIf(hasGo)('go runtime demos', () => {
  for (const name of ['go-reverse', 'go-sum']) {
    it(`verifies ${name} end-to-end`, async () => {
      const r = await verifyGoTechnique(demoDir(name));
      expect(r.verified).toBe(true);
      expect(r.negativeSanityHeld).toBe(true);
    }, 60000);
  }
});

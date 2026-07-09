import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { verifyPythonTechnique, countPyAsserts, importsPyImpl, pyDefs } from '../../src/adapters/python.ts';

const here = dirname(fileURLToPath(import.meta.url));
const demoDir = (name: string) => join(here, '..', '..', 'demo', name);

function pytestAvailable(): boolean {
  const py = process.platform === 'win32' ? 'python' : 'python3';
  try {
    execFileSync(py, ['-m', 'pytest', '--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
const hasPytest = pytestAvailable();

describe('python static checks', () => {
  it('countPyAsserts / importsPyImpl / pyDefs', () => {
    expect(countPyAsserts('assert x == 1\nassert y')).toBe(2);
    expect(importsPyImpl('from impl import foo')).toBe(true);
    expect(importsPyImpl('x = 1')).toBe(false);
    expect(pyDefs('def foo(a):\n    return a\n')).toEqual(['foo']);
  });
});

describe.runIf(hasPytest)('python runtime demos', () => {
  for (const name of ['py-anagram', 'py-word-frequency', 'py-fib']) {
    it(`verifies ${name} end-to-end`, async () => {
      const r = await verifyPythonTechnique(demoDir(name));
      expect(r.verified).toBe(true);
      expect(r.negativeSanityHeld).toBe(true);
    }, 40000);
  }
});

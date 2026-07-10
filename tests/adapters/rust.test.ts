import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { verifyRustTechnique, countRustAsserts, importsRustCrate, rustStub } from '../../src/adapters/rust.ts';

const here = dirname(fileURLToPath(import.meta.url));
const demoDir = (name: string) => join(here, '..', '..', 'demo', name);

function cargoAvailable(): boolean {
  try {
    execFileSync('cargo', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
const hasCargo = cargoAvailable();

describe('rust static checks', () => {
  it('countRustAsserts / importsRustCrate / rustStub', () => {
    expect(countRustAsserts('assert_eq!(a, b); assert!(c);')).toBe(2);
    expect(importsRustCrate('use technique::foo;')).toBe(true);
    expect(importsRustCrate('let x = 1;')).toBe(false);
    const stub = rustStub('pub fn foo(a: i32) -> i32 {\n    a\n}\n');
    expect(stub).toContain('panic!("MUTATED")');
    expect(stub).toContain('pub fn foo(a: i32) -> i32');
  });
});

describe.runIf(hasCargo)('rust runtime demos', () => {
  for (const name of ['rust-reverse', 'rust-sum']) {
    it(`verifies ${name} end-to-end`, async () => {
      const r = await verifyRustTechnique(demoDir(name));
      expect(r.verified).toBe(true);
      expect(r.negativeSanityHeld).toBe(true);
    }, 180000);
  }
});

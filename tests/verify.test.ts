import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { countAsserts, importsImpl, exportedNames, verifyTechnique } from '../src/verify.ts';

const here = dirname(fileURLToPath(import.meta.url));
const fx = (name: string) => join(here, 'fixtures', name);

describe('static checks', () => {
  it('countAsserts counts expect(...) calls', () => {
    expect(countAsserts('expect(a).toBe(1); expect(b).toBe(2);')).toBe(2);
  });
  it('importsImpl detects import of ./impl', () => {
    expect(importsImpl("import { x } from './impl.ts';")).toBe(true);
    expect(importsImpl("test('t', () => expect(1).toBe(1));")).toBe(false);
  });
  it('exportedNames extracts function exports', () => {
    expect(exportedNames('export function reverseString(s){return s}')).toEqual(['reverseString']);
  });
});

describe('verifyTechnique', () => {
  it('verifies a genuine technique', async () => {
    const r = await verifyTechnique(fx('good'));
    expect(r.verified).toBe(true);
    expect(r.passed).toBe(true);
    expect(r.negativeSanityHeld).toBe(true);
  });

  // ★ LOAD-BEARING PROOF: トートロジー/echo テストは verified から弾かれる
  it('rejects a tautological test (no import / survives mutation)', async () => {
    const r = await verifyTechnique(fx('tautology'));
    expect(r.verified).toBe(false);
    expect(r.reasons.length).toBeGreaterThan(0);
  });
});

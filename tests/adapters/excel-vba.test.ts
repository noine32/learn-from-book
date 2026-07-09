import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mutateBas, verifyVbaTechnique } from '../../src/adapters/excel-vba.ts';

const here = dirname(fileURLToPath(import.meta.url));
const demo = join(here, '..', '..', 'demo', 'vba-reverse');
const demoCells = join(here, '..', '..', 'demo', 'vba-get-end-row');
const isWin = process.platform === 'win32';

describe('mutateBas', () => {
  it('replaces the target function body with a sentinel', () => {
    const src = 'Function Foo(ByVal x As String) As String\n    Foo = x\nEnd Function\n';
    const out = mutateBas(src, 'Foo');
    expect(out).toContain('Foo = "___MUTATED_SENTINEL___"');
    expect(out).not.toContain('Foo = x');
    expect(out).toContain('End Function');
  });
});

// Excel COM を実走するため Windows のみ。COM を2回起動するので時間がかかる。
describe.runIf(isWin)('verifyVbaTechnique (Windows / Excel COM)', () => {
  it('verifies the VBA reverse demo end-to-end', async () => {
    const r = await verifyVbaTechnique(demo);
    expect(r.verified).toBe(true);
    expect(r.passed).toBe(true);
    expect(r.negativeSanityHeld).toBe(true);
  }, 90000);

  // ワークシート操作系（Range引数＋セル事前設定＋戻り値照合）— 拡張スキーマ
  it('verifies a worksheet/Range technique (GetEndRow) with cell setup', async () => {
    const r = await verifyVbaTechnique(demoCells);
    expect(r.verified).toBe(true);
    expect(r.negativeSanityHeld).toBe(true);
  }, 90000);
});

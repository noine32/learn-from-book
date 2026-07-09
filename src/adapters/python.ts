import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { VerifyResult } from '../types.ts';

const PY = process.platform === 'win32' ? 'python' : 'python3';

export function countPyAsserts(testSrc: string): number {
  return (testSrc.match(/\bassert\b/g) ?? []).length;
}

export function importsPyImpl(testSrc: string): boolean {
  return /(?:from\s+impl\s+import|import\s+impl)\b/.test(testSrc);
}

/** impl.py のトップレベル def 名を静的抽出する（ミューテーション用）。 */
export function pyDefs(implSrc: string): string[] {
  const names = new Set<string>();
  for (const m of implSrc.matchAll(/^def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/gm)) names.add(m[1]);
  return [...names];
}

/** cwd=dir で pytest を実行（`python -m pytest` は cwd を sys.path に載せるので `from impl import` が解決する）。 */
export function runPytest(dir: string): boolean {
  try {
    execFileSync(PY, ['-m', 'pytest', '-q', 'test_impl.py'], {
      cwd: dir,
      stdio: 'ignore',
      timeout: 60000,
      windowsHide: true,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * python ランタイムの検証。dir に impl.py と test_impl.py がある前提。
 * verified には positive pass ＋ assert数≥1 ＋ 実装import ＋ negative-sanity（ミューテーションで落ちる）が必須。
 */
export async function verifyPythonTechnique(dir: string): Promise<VerifyResult> {
  const implPath = join(dir, 'impl.py');
  const testPath = join(dir, 'test_impl.py');
  const testSrc = readFileSync(testPath, 'utf8');
  const implSrc = readFileSync(implPath, 'utf8');
  const reasons: string[] = [];

  const assertCount = countPyAsserts(testSrc);
  if (assertCount < 1) reasons.push('assert が 0 件');

  const imports = importsPyImpl(testSrc);
  if (!imports) reasons.push('テストが impl を import していない');

  const passed = runPytest(dir);
  if (!passed) reasons.push('positive テストが pass しない');

  // negative-sanity: 全 def を例外送出に置換 → テストが落ちること
  const names = pyDefs(implSrc);
  let negativeSanityHeld = false;
  try {
    const stub = names.length
      ? names.map((n) => `def ${n}(*a, **k):\n    raise Exception('MUTATED')`).join('\n\n')
      : `raise Exception('MUTATED')`;
    writeFileSync(implPath, stub + '\n');
    const mutatedPassed = runPytest(dir);
    negativeSanityHeld = !mutatedPassed;
  } finally {
    writeFileSync(implPath, implSrc);
  }
  if (!negativeSanityHeld) reasons.push('実装をミューテーションしてもテストが pass（トートロジー）');

  const verified = passed && assertCount >= 1 && imports && negativeSanityHeld;
  return { verified, passed, assertCount, importsImpl: imports, negativeSanityHeld, reasons };
}

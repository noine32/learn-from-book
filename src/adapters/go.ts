import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { VerifyResult } from '../types.ts';

export function countGoAsserts(testSrc: string): number {
  // Go tests fail via t.Error*/t.Fatal* — treat those as the assertions.
  return (testSrc.match(/t\.(?:Error|Fatal)/g) ?? []).length;
}

export function goPackage(src: string): string {
  return src.match(/^package\s+(\w+)/m)?.[1] ?? 'technique';
}

/** impl.go の各トップレベル func を panic 化した stub ソースを生成する（ミューテーション用）。 */
export function goStub(implSrc: string): string {
  const pkg = goPackage(implSrc);
  const stubs: string[] = [];
  for (const m of implSrc.matchAll(/^func\s+(\w+)\s*\(([^)]*)\)\s*([^{\n]*?)\s*\{/gm)) {
    const name = m[1];
    const params = m[2];
    const ret = m[3].trim();
    stubs.push(`func ${name}(${params})${ret ? ' ' + ret : ''} {\n\tpanic("MUTATED")\n}`);
  }
  return `package ${pkg}\n\n${stubs.join('\n\n')}\n`;
}

export function runGoTest(dir: string): boolean {
  try {
    execFileSync('go', ['test', './...'], { cwd: dir, stdio: 'ignore', timeout: 120000, windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * go ランタイムの検証。dir に go.mod / impl.go / impl_test.go がある前提（同一パッケージ）。
 * verified には positive pass ＋ t.Error/t.Fatal≥1 ＋ negative-sanity（全 func を panic 化するとテストが落ちる）が必須。
 * Go の同一パッケージテストは impl を直接参照するため importsImpl は該当なしで true。
 */
export async function verifyGoTechnique(dir: string): Promise<VerifyResult> {
  const implPath = join(dir, 'impl.go');
  const testPath = join(dir, 'impl_test.go');
  const testSrc = readFileSync(testPath, 'utf8');
  const implSrc = readFileSync(implPath, 'utf8');
  const reasons: string[] = [];

  const assertCount = countGoAsserts(testSrc);
  if (assertCount < 1) reasons.push('t.Error/t.Fatal が 0 件');

  const passed = runGoTest(dir);
  if (!passed) reasons.push('positive テストが pass しない');

  let negativeSanityHeld = false;
  try {
    writeFileSync(implPath, goStub(implSrc));
    const mutatedPassed = runGoTest(dir);
    negativeSanityHeld = !mutatedPassed;
  } finally {
    writeFileSync(implPath, implSrc);
  }
  if (!negativeSanityHeld) reasons.push('ミューテーションしてもテストが pass（トートロジー）');

  const verified = passed && assertCount >= 1 && negativeSanityHeld;
  return { verified, passed, assertCount, importsImpl: true, negativeSanityHeld, reasons };
}

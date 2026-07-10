import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { VerifyResult } from '../types.ts';

export function countRustAsserts(testSrc: string): number {
  return (testSrc.match(/\bassert(?:_eq|_ne)?!/g) ?? []).length;
}

export function importsRustCrate(testSrc: string): boolean {
  return /use\s+technique(?:::|;)/.test(testSrc);
}

/** src/lib.rs の各 pub fn を panic! 化した stub ソースを生成する（ミューテーション用）。 */
export function rustStub(implSrc: string): string {
  const stubs: string[] = [];
  for (const m of implSrc.matchAll(/pub\s+fn\s+(\w+)\s*(\([^)]*\))\s*(->\s*[^{]+?)?\s*\{/g)) {
    const name = m[1];
    const params = m[2];
    const ret = (m[3] ?? '').trim();
    stubs.push(`pub fn ${name}${params}${ret ? ' ' + ret : ''} { panic!("MUTATED") }`);
  }
  return stubs.join('\n\n') + '\n';
}

export function runCargoTest(dir: string): boolean {
  try {
    execFileSync('cargo', ['test', '--quiet'], { cwd: dir, stdio: 'ignore', timeout: 180000, windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * rust ランタイムの検証。dir に Cargo.toml / src/lib.rs / tests/integration.rs がある前提。
 * verified には positive pass ＋ assert!≥1 ＋ crate use ＋ negative-sanity（pub fn を panic 化するとテストが落ちる）が必須。
 */
export async function verifyRustTechnique(dir: string): Promise<VerifyResult> {
  const implPath = join(dir, 'src', 'lib.rs');
  const testPath = join(dir, 'tests', 'integration.rs');
  const testSrc = readFileSync(testPath, 'utf8');
  const implSrc = readFileSync(implPath, 'utf8');
  const reasons: string[] = [];

  const assertCount = countRustAsserts(testSrc);
  if (assertCount < 1) reasons.push('assert! が 0 件');

  const imports = importsRustCrate(testSrc);
  if (!imports) reasons.push('テストが technique クレートを use していない');

  const passed = runCargoTest(dir);
  if (!passed) reasons.push('positive テストが pass しない');

  let negativeSanityHeld = false;
  try {
    writeFileSync(implPath, rustStub(implSrc));
    const mutatedPassed = runCargoTest(dir);
    negativeSanityHeld = !mutatedPassed;
  } finally {
    writeFileSync(implPath, implSrc);
  }
  if (!negativeSanityHeld) reasons.push('ミューテーションしてもテストが pass（トートロジー）');

  const verified = passed && assertCount >= 1 && imports && negativeSanityHeld;
  return { verified, passed, assertCount, importsImpl: imports, negativeSanityHeld, reasons };
}

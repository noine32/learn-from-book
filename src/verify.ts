import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { VerifyResult } from './types.ts';

// npx/.cmd を介さず node で vitest の CLI を直接起動する（Windows の .cmd 問題を回避）。
const VITEST_BIN = join(process.cwd(), 'node_modules', 'vitest', 'vitest.mjs');

export function countAsserts(testSrc: string): number {
  return (testSrc.match(/\bexpect\s*\(/g) ?? []).length;
}

export function importsImpl(testSrc: string): boolean {
  return /from\s+['"]\.\/impl(?:\.ts)?['"]/.test(testSrc);
}

/** 実装ソースから export された識別子名を静的抽出する（ミューテーション用）。 */
export function exportedNames(implSrc: string): string[] {
  const names = new Set<string>();
  for (const m of implSrc.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
  for (const m of implSrc.matchAll(/export\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
  return [...names];
}

/** vitest で1テストファイルを隔離実行。exit 0 (=全pass) なら true。 */
export function runVitest(testPath: string): boolean {
  try {
    execFileSync(process.execPath, [VITEST_BIN, 'run', testPath, '--config', 'technique-runner.config.ts'], {
      cwd: process.cwd(),
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * §6 客観性規約の機械チェック。
 * verified には positive pass ＋ assert数≥1 ＋ 実装import ＋ negative-sanity（ミューテーションで落ちる）が必須。
 * negative-sanity: 実装の全 export を throw 化してもテストが pass するなら、
 * テストは実装を検証していない（トートロジー）とみなし弾く。
 */
export async function verifyTechnique(dir: string): Promise<VerifyResult> {
  const implPath = join(dir, 'impl.ts');
  const testPath = join(dir, 'impl.test.ts');
  const testSrc = readFileSync(testPath, 'utf8');
  const implSrc = readFileSync(implPath, 'utf8');
  const reasons: string[] = [];

  const assertCount = countAsserts(testSrc);
  if (assertCount < 1) reasons.push('assert が 0 件');

  const imports = importsImpl(testSrc);
  if (!imports) reasons.push('テストが ./impl を import していない');

  // 1) positive: 本物の実装でテストが pass すること
  const passed = runVitest(testPath);
  if (!passed) reasons.push('positive テストが pass しない');

  // 2) negative-sanity: 実装をミューテーション（全 export を throw 化）→ テストが落ちること
  const names = exportedNames(implSrc);
  let negativeSanityHeld = false;
  try {
    const stub = names.length
      ? names.map((n) => `export const ${n} = (..._a: unknown[]): any => { throw new Error('MUTATED'); };`).join('\n')
      : `throw new Error('MUTATED');`;
    writeFileSync(implPath, stub);
    const mutatedPassed = runVitest(testPath);
    negativeSanityHeld = !mutatedPassed; // ミューテーションで落ちた = テストは実装を検証している
  } finally {
    writeFileSync(implPath, implSrc); // 必ず元に戻す
  }
  if (!negativeSanityHeld) reasons.push('実装をミューテーションしてもテストが pass（トートロジー）');

  const verified = passed && assertCount >= 1 && imports && negativeSanityHeld;
  return { verified, passed, assertCount, importsImpl: imports, negativeSanityHeld, reasons };
}

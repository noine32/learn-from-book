import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { VerifyResult } from '../types.ts';

const RUN_PS1 = join(process.cwd(), 'src', 'adapters', 'run.ps1');
const SENTINEL = '___MUTATED_SENTINEL___';

export function isWindows(): boolean {
  return process.platform === 'win32';
}

/**
 * VBA の対象 Function の本体を sentinel 代入へ置換する（negative-sanity 用ミューテーション）。
 * `Function <fn>(...) ... End Function` の本体を `<fn> = "___MUTATED_SENTINEL___"` に差し替える。
 */
const NUMERIC_RETURN_TYPES = ['long', 'integer', 'double', 'single', 'byte', 'currency', 'decimal', 'longlong'];

export function mutateBas(basSrc: string, fn: string): string {
  // Function: 本体を sentinel 代入に置換。戻り値型に合わせる
  // （数値関数へ文字列 sentinel を入れると VBA 実行時エラー→非表示Excelでダイアログ・ハングの元になるため）。
  const funcRe = new RegExp(`(Function\\s+${fn}\\s*\\([^)]*\\)([^\\n]*)\\n)([\\s\\S]*?)(End Function)`, 'i');
  const m = funcRe.exec(basSrc);
  if (m) {
    const retType = (m[2].match(/As\s+(\w+)/i)?.[1] ?? '').toLowerCase();
    const sentinel = NUMERIC_RETURN_TYPES.includes(retType) ? '-987654321' : `"${SENTINEL}"`;
    return basSrc.replace(funcRe, `$1    ${fn} = ${sentinel}\n$4`);
  }
  // Sub: 本体を空にする（副作用が消える → expectCells 不一致で落ちる）。
  const subRe = new RegExp(`(Sub\\s+${fn}\\s*\\([^)]*\\)[^\\n]*\\n)([\\s\\S]*?)(End Sub)`, 'i');
  return basSrc.replace(subRe, `$1$3`);
}

/** run.ps1 を実行。全ケース一致(exit 0)なら true。 */
function runPs1(basFile: string, casesFile: string): boolean {
  try {
    execFileSync(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', RUN_PS1, '-BasFile', basFile, '-CasesFile', casesFile],
      // timeout: VBA実行時エラーで非表示Excelがダイアログ待ちハングした場合の保険（超過で kill→false）。
      { cwd: process.cwd(), stdio: 'ignore', timeout: 60000, windowsHide: true },
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * excel-vba ランタイムの検証。dir に impl.bas と cases.json がある前提。
 * positive（本物）で全ケース一致 ＋ mutation（本体 sentinel 化）で不一致（negative-sanity）が必要。
 * Windows 以外は verified=false（COM 不可）。importsImpl は vba では該当なしのため true 扱い。
 */
export async function verifyVbaTechnique(dir: string): Promise<VerifyResult> {
  const reasons: string[] = [];
  if (!isWindows()) {
    return {
      verified: false,
      passed: false,
      assertCount: 0,
      importsImpl: true,
      negativeSanityHeld: false,
      reasons: ['excel-vba は Windows 専用（COM 不可）'],
    };
  }

  const basPath = join(dir, 'impl.bas');
  const casesPath = join(dir, 'cases.json');
  const basSrc = readFileSync(basPath, 'utf8');
  const cases = JSON.parse(readFileSync(casesPath, 'utf8')) as { fn: string; cases: unknown[] };
  const fn = cases.fn;

  const assertCount = Array.isArray(cases.cases) ? cases.cases.length : 0;
  if (assertCount < 1) reasons.push('cases が 0 件');

  // 1) positive: 本物の実装で全ケース一致
  const passed = runPs1(basPath, casesPath);
  if (!passed) reasons.push('positive ケースが pass しない');

  // 2) negative-sanity: 本体を sentinel 化 → 不一致（＝cases が実装を検証している）
  const mutatedBasPath = join(dir, '.impl.mutated.bas');
  let negativeSanityHeld = false;
  try {
    writeFileSync(mutatedBasPath, mutateBas(basSrc, fn));
    const mutatedPassed = runPs1(mutatedBasPath, casesPath);
    negativeSanityHeld = !mutatedPassed;
  } finally {
    if (existsSync(mutatedBasPath)) rmSync(mutatedBasPath);
  }
  if (!negativeSanityHeld) reasons.push('ミューテーションしても pass（cases が実装を検証していない）');

  const verified = passed && assertCount >= 1 && negativeSanityHeld;
  return { verified, passed, assertCount, importsImpl: true, negativeSanityHeld, reasons };
}

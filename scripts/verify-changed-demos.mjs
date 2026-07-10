// PR で変更された demo/<name> ディレクトリを検出し、harness（src/cli.ts）で実際に検証して
// 結果の markdown を verify-summary.md に書き出す。verify-technique ワークフローから呼ばれ、
// その内容を PR コメントとして投稿する。
//
// 終了コード = 検証に失敗した（スキップ以外の）テクニック数（0 なら全 OK）。
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE_REF || 'origin/main';
const SUMMARY_FILE = process.env.SUMMARY_FILE || 'verify-summary.md';
const MARKER = '<!-- verify-technique -->';

function changedDemoDirs() {
  let out = '';
  try {
    out = execSync(`git diff --name-only ${BASE}...HEAD -- demo/`, { encoding: 'utf8' });
  } catch {
    out = '';
  }
  const dirs = new Set();
  for (const f of out.split('\n').map((s) => s.trim()).filter(Boolean)) {
    const parts = f.split('/');
    if (parts[0] === 'demo' && parts.length >= 2) dirs.add(`demo/${parts[1]}`);
  }
  // 削除されたディレクトリ（もう存在しない）は除外
  return [...dirs].filter((d) => existsSync(d)).sort();
}

function detectRuntime(dir) {
  if (existsSync(join(dir, 'impl.bas'))) return 'vba';
  if (existsSync(join(dir, 'impl.py'))) return 'python';
  if (existsSync(join(dir, 'impl.go')) || existsSync(join(dir, 'go.mod'))) return 'go';
  if (existsSync(join(dir, 'Cargo.toml'))) return 'rust';
  return 'node';
}

function runCli(dir) {
  try {
    const out = execSync(`npx tsx src/cli.ts ${dir}`, { encoding: 'utf8' });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: `${e.stdout || ''}${e.stderr || ''}` };
  }
}

function parseVerified(out) {
  // cli は VerifyResult の JSON を出力する。末尾の JSON を拾って verified を読む。
  const start = out.indexOf('{');
  const end = out.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(out.slice(start, end + 1)).verified === true;
    } catch {
      /* fall through */
    }
  }
  return null;
}

const dirs = changedDemoDirs();
const lines = [];
lines.push(MARKER);
lines.push('### 🧪 テクニック検証 / Technique verification (learn-from-book)');
lines.push('');

let failed = 0;

if (dirs.length === 0) {
  lines.push('変更された `demo/` はありません。 / No changed demos to verify.');
} else {
  lines.push('変更された `demo/` を harness で検証しました。 / Verified changed demos with the harness.');
  lines.push('');
  lines.push('| テクニック / Technique | ランタイム / Runtime | 結果 / Result |');
  lines.push('|---|---|---|');
  for (const dir of dirs) {
    const rt = detectRuntime(dir);
    if (rt === 'vba') {
      lines.push(`| \`${dir}\` | excel-vba | ⏭️ skipped |`);
      continue;
    }
    const { out } = runCli(dir);
    const verified = parseVerified(out);
    if (verified === true) {
      lines.push(`| \`${dir}\` | ${rt} | ✅ verified |`);
    } else {
      failed += 1;
      lines.push(`| \`${dir}\` | ${rt} | ❌ not verified |`);
    }
  }
  lines.push('');
  lines.push('<sub>Excel/VBA は CI に Excel が無いため実行せずスキップ（ローカル Windows で検証してください）。 / Excel/VBA is skipped in CI (no Excel); verify locally on Windows.</sub>');
}

const body = lines.join('\n') + '\n';
writeFileSync(SUMMARY_FILE, body);
process.stdout.write(body);
process.exit(failed);

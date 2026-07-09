import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { verifyTechnique } from './verify.ts';
import { verifyVbaTechnique } from './adapters/excel-vba.ts';

// 使い方: npx tsx src/cli.ts <technique-dir>
// ランタイムは中身で自動判定: impl.bas があれば excel-vba(Windows専用)、なければ node(impl.ts + impl.test.ts)。
// 結果(VerifyResult)を JSON で出力し、verified なら exit 0 / それ以外 exit 1。
const dir = process.argv[2];
if (!dir) {
  console.error('usage: npx tsx src/cli.ts <technique-dir>');
  process.exit(2);
}

const result = existsSync(join(dir, 'impl.bas'))
  ? await verifyVbaTechnique(dir)
  : await verifyTechnique(dir);

console.log(JSON.stringify(result, null, 2));
process.exit(result.verified ? 0 : 1);

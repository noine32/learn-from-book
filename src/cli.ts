import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { verifyTechnique } from './verify.ts';
import { verifyVbaTechnique } from './adapters/excel-vba.ts';
import { verifyPythonTechnique } from './adapters/python.ts';
import { verifyGoTechnique } from './adapters/go.ts';

// 使い方: npx tsx src/cli.ts <technique-dir>
// ランタイムは中身で自動判定: impl.bas=excel-vba(Windows) / impl.py=python / impl.go=go / それ以外=node(impl.ts)。
// 結果(VerifyResult)を JSON で出力し、verified なら exit 0 / それ以外 exit 1。
const dir = process.argv[2];
if (!dir) {
  console.error('usage: npx tsx src/cli.ts <technique-dir>');
  process.exit(2);
}

const result = existsSync(join(dir, 'impl.bas'))
  ? await verifyVbaTechnique(dir)
  : existsSync(join(dir, 'impl.py'))
    ? await verifyPythonTechnique(dir)
    : existsSync(join(dir, 'impl.go'))
      ? await verifyGoTechnique(dir)
      : await verifyTechnique(dir);

console.log(JSON.stringify(result, null, 2));
process.exit(result.verified ? 0 : 1);

import { verifyTechnique } from './verify.ts';

// 使い方: npx tsx src/cli.ts <technique-dir>
// <technique-dir> に impl.ts と impl.test.ts がある前提。
// 結果(VerifyResult)を JSON で出力し、verified なら exit 0 / それ以外 exit 1。
const dir = process.argv[2];
if (!dir) {
  console.error('usage: npx tsx src/cli.ts <technique-dir>');
  process.exit(2);
}

const result = await verifyTechnique(dir);
console.log(JSON.stringify(result, null, 2));
process.exit(result.verified ? 0 : 1);

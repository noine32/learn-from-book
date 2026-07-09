import { verifyTechnique } from '../verify.ts';
import type { Technique, VerifyResult, Status } from '../types.ts';

/**
 * node ランタイムの1技術を検証し、次状態を返す。
 * verified なら 'verified'、それ以外は 'failed'（分類は上位で failureClass を付す）。
 */
export async function runNodeTechnique(
  dir: string,
  _t: Technique,
): Promise<{ result: VerifyResult; nextStatus: Status }> {
  const result = await verifyTechnique(dir);
  const nextStatus: Status = result.verified ? 'verified' : 'failed';
  return { result, nextStatus };
}

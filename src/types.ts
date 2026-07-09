export type Runtime = 'node' | 'excel-vba';

export type Status =
  | 'backlog'
  | 'experimenting'
  | 'verified'
  | 'failed'
  | 'skipped'
  | 'promoted'
  | 'rejected'
  | 'gate-retry';

export type FailureClass = 'impl-bug' | 'env-missing' | 'claim-limit' | 'bad-test';

export interface Technique {
  id: string;
  name: string;
  source: string; // 例 "ch3 p42"
  claim: string; // 1文
  experimentIdea: string;
  runtime: Runtime;
  dependsOn: string[];
  status: Status;
  failureClass?: FailureClass;
}

export interface VerifyResult {
  verified: boolean;
  passed: boolean; // positive テストが pass したか
  assertCount: number;
  importsImpl: boolean;
  negativeSanityHeld: boolean; // impl をミューテーションするとテストが落ちたか
  reasons: string[]; // verified=false の理由
}

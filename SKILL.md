---
name: learn-from-book
description: プログラミング技術書PDFから技術を1つずつ「実装→テスト→§6客観検証→承認→skill化」で学ぶ体験的学習パイプライン。読むだけで終わらせず、コード実行とミューテーションで"本当に落とし込めたか"を客観検証する。node ランタイム対応（excel-vba は将来）。「本から学んで」「この技術書を検証して」「技術書のこの章を試して」で発動。
---

# learn-from-book

技術書を「読む」だけでなく「実装して・試して・検証済みの技術を増やす」ための体験的学習パイプライン。核心は §6 の客観検証（トートロジー/echo テストを機械的に弾く）。

## いつ使うか

- プログラミング技術書のPDFを渡され、「読んで・試して・検証済みの技術として蓄積したい」時。

## 手順（node ランタイム）

1. **抽出**: PDF をテキスト抽出（スキャン/画像PDFは非対応と明示）。**人が抽出結果を目視**してから進む。
   - ⚠ 日本語（Adobe-Japan1 等の CID フォント）PDFは `pdftotext`(poppler) だと文字化けする。**PyMuPDF(`pip install pymupdf`)推奨**（`fitz` で `page.get_text()`）。
   - ⚠ **設定・命名規則・ショートカット・コメント等の"慣習/practice"系は実行検証の対象外**（テストで pass/fail を作れない）。検証できるのは「コードで観測可能な振る舞いを持つ技術」のみ。それ以外は該当なしとして扱う。
2. **backlog 化**: 技術候補を1件=1行で台帳化。**1技術 = 独立に真偽判定できる1つの検証可能な主張**（章やコードブロック単位ではない）。schema: `{ id, name, source, claim, experimentIdea, runtime, dependsOn, status }`。dedup は正規化名（`src/ledger.ts`）。
3. **実験**: 各技術ごとに作業ディレクトリ（例 `learning-lab/<book>/<technique>/`）に `impl.ts` と `impl.test.ts` を書く。テストは **§6 規約**に従う:
   - `./impl` を import している（ハードコード値を assert するだけの自作自演は不可）
   - アサート ≥ 1
   - **実装をミューテーションすると落ちる**（ハーネスが全 export を throw 化して確認する）
4. **検証**: `npx tsx src/cli.ts <technique-dir>` を実行。`VerifyResult`(JSON) が返り、`verified=true` かつ exit 0 なら客観検証OK。
   - `verified=false` は **failure_class**（`impl-bug` / `env-missing` / `claim-limit` / `bad-test`）を付けて記録。環境エラー(`env-missing`)はリトライ対象外。
5. **承認ゲート（人）**: 技術名・主張・テスト・pass結果・**negative-sanity の効き**・why/limits/pitfalls 草稿・SKILL.md 草稿・名前衝突を提示。人が「**このテストは主張を本当に検証しているか**」を確認して 承認 / 却下 / 修正要求。
6. **昇格**: 承認された技術のみ `~/.claude/skills/<technique>/` へ（**このリポジトリには置かない**）。knowledge（why/limits/pitfalls・失敗）は Obsidian（非公開）へ。

## §6 検証の客観性（このスキルの生命線）

`verified` には **positive pass ＋ アサート≥1 ＋ 実装import ＋ negative-sanity（ミューテーションで落ちる）** の全てが必要。「pass＋言語化」だけでは満たさない。完全自動化しきれない「期待値が echo でない」等は手順5の人チェックが backstop する。

## 厳守

- **本のPDF/本文/本由来の個別 skill・knowledge を、このリポジトリに絶対コミットしない**（`.gitignore` で `learning-lab/`・`*.pdf`・`books/` 除外）。
- **生成コードは実行前にレビュー**する（作業ディレクトリ隔離であって実行隔離ではない。任意コードがユーザ権限で走る）。

## excel-vba ランタイム（Windows専用・対応済み）

- 技術ディレクトリ構成: `impl.bas`（`Attribute VB_Name` 付き・対象は Function または Sub）＋ `cases.json`。
- `cases.json` スキーマ（`setup`/`expect`/`expectCells` は任意）:
  ```json
  {
    "fn": "GetEndRow",
    "cases": [
      {
        "setup": { "A1": 10, "A2": 20 },     // 実行前にセルへ値を書く（ワークシート操作系に必須）
        "args":  [ 5, { "range": "A1" } ],   // スカラ、または { "range": "アドレス" } で Range を渡す
        "expect": 5,                          // 戻り値の期待値（任意）
        "expectCells": { "B1": "done" }       // 実行後のセル状態の期待値（副作用系。任意）
      }
    ]
  }
  ```
- 検証: `npx tsx src/cli.ts <dir>` が `impl.bas` を検出して excel-vba で実行。**新規Excelインスタンスを生成**し `.bas` を Import→ケースごとにシート初期化→`setup`書込→`Application.Run`（Range引数対応）→`expect`/`expectCells`照合、**型対応ミューテーション（Function=戻り値 sentinel／Sub=空本体）で negative-sanity** を確認。既存Excelは触らず自分のインスタンスのみ後始末。VBA実行時エラーのハングは timeout ガードで fail 化。
- 前提: AccessVBOM（VBAプロジェクトへのアクセスを信頼）有効。Mac では実行不可（読む/参照のみ）。

## 参考

- 検証ハーネス: `src/verify.ts`（`verifyTechnique`）／ node アダプタ: `src/adapters/node.ts`
- 台帳: `src/ledger.ts` ／ 型: `src/types.ts`
- デモ: `demo/debounce/`（自作・著作権フリー）

---
name: バグ報告 / Bug report
about: 検証されない・想定通りに動かない / Something isn't verifying or behaving as expected
title: '[bug] '
labels: bug
---

<!-- 日本語・英語どちらでもOK / Japanese or English both welcome -->

**何が起きたか / What happened**
問題の明確な説明。 / A clear description of the problem.

**ランタイム / Runtime**
- [ ] Node
- [ ] Python
- [ ] Go
- [ ] Rust
- [ ] Excel/VBA（Windows/Excel のバージョン + AccessVBOM の状態も記載 / include Windows/Excel version + AccessVBOM state）

**再現手順 / Reproduce**
1. テクニックディレクトリの中身 / Technique dir contents (`impl.*` / test / `cases.json`)
2. 実行したコマンド / Command run (e.g. `npx tsx src/cli.ts demo/...`)
3. `VerifyResult` の JSON / エラー出力 / The `VerifyResult` JSON / error output

**期待した結果 / Expected**
`verified` や結果がどうなるはずだったか。 / What you expected `verified` / the result to be.

**環境 / Environment**
- OS:
- Node version (`node -v`):
- Python/pytest version（該当すれば / if relevant）:

---
name: テクニック/ランタイムの提案 / Technique or runtime request
about: デモのテクニックや、新しく対応するランタイムを提案する / Suggest a demo technique or a new runtime to support
title: '[request] '
labels: enhancement
---

<!-- 日本語・英語どちらでもOK / Japanese or English both welcome -->

**種別 / Type**
- [ ] デモのテクニック / Demo technique
- [ ] 新しいランタイム / New runtime (e.g. Go, Rust)

**何を・なぜ / What & why**
そのテクニックやランタイムと、なぜ適しているか（テストを実行して検証可能であること）。
Describe the technique or runtime and why it's a good fit (must be verifiable by executing a test).

**テクニックの場合 / For a technique**
- ランタイム / Runtime:
- シグネチャ・挙動 / Signature / behavior:
- 入力→期待出力の例をいくつか（これがテストになる） / A couple of input → expected-output examples (these become the test):

**ランタイムの場合 / For a runtime**
- ツールチェーンとテストの実行方法 / Toolchain + how tests run (e.g. `go test`, `cargo test`):
- ミューテーション（実装を壊すこと）でテストが失敗する仕組み / How a mutation (breaking the impl) would make its test fail:

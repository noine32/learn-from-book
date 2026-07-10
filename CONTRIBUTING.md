# コントリビュート

**日本語** | [English](./CONTRIBUTING.en.md)

興味を持ってくれてありがとう！ 本プロジェクトは、学んだテクニックを**実行して**検証する。
そのためコントリビュートは、テクニックやランタイムの追加が中心になる。

## セットアップ

```bash
npm install          # Node 22+
npm run test:node    # node + python テスト（速い; Excel 不要）
npm test             # フルスイート（Windows では Excel/VBA テストも追加）
npm run typecheck
```

Python デモには `pytest`（`pip install pytest`）が必要。Excel/VBA デモには Windows +
Excel と「VBA プロジェクトオブジェクトモデルへのアクセスを信頼する」を有効化したものが必要。

## テクニック（デモ）の追加

`demo/<name>/` の下に、いずれかのランタイムに合致するディレクトリを作る:

- **Node:** `impl.ts` + `impl.test.ts`（vitest）。テストは `import './impl'` して実挙動を assert する。
- **Python:** `impl.py` + `test_impl.py`（pytest）。テストは `from impl import ...` する。
- **Go:** `go.mod` + `impl.go` + `impl_test.go`（`go test`）。
- **Rust:** `Cargo.toml` + `src/lib.rs` + `tests/integration.rs`（`cargo test`）。
- **Excel/VBA:** `impl.bas` + `cases.json`（スキーマは `skills/learn-from-book/SKILL.md` 参照）。

検証:

```bash
npx tsx src/cli.ts demo/<name>
```

`verified` になるには §6 チェック（`skills/learn-from-book/SKILL.md` 参照）を満たす必要がある:
テストが実装を import・使用し、assertion を持ち、**実装をミューテーションすると失敗する**
（トートロジー／echo テストは棄却される）。

## ルール

- 実装は**独立に書き起こす**こと。書籍／出典の本文やコードをコピーしない。
- `src/adapters/run.ps1` は**ASCII のみ**に保つ（ガードテストで強制——Windows PowerShell は非 ASCII を誤読する）。
- リポジトリに秘密情報や個人パスを入れない。書籍 PDF をコミットしない（`.gitignore` が
  `learning-lab/`, `*.pdf`, `books/` をカバー）。
- 新しいテクニックを CI（またはローカルスイート）がカバーするよう、テストを追加する。

## ランタイムの追加

`src/adapters/<runtime>.ts` を追加し、`VerifyResult` を返す `verify<Runtime>Technique(dir)`
を公開する。node/python アダプタを踏襲し（ポジティブ実行 + ミューテーションベースの
ネガティブサニティ）、`src/cli.ts` で検出し、gate 付きのテストを追加する。

## 言語について

本リポジトリは**日本語を基本言語**とし、英語をマルチ言語対応として提供している
（`README.md` / `README.en.md`、`docs/DEMO.md` / `docs/DEMO.en.md` など）。ドキュメントを
更新する際は、可能であれば日本語版と英語版の両方を更新してほしい（片方だけでも歓迎——
その旨を PR に書いてくれれば、もう片方は追従する）。

# learn-from-book

[![CI](https://github.com/noine32/learn-from-book/actions/workflows/ci.yml/badge.svg)](https://github.com/noine32/learn-from-book/actions/workflows/ci.yml)
[![Compat](https://github.com/noine32/learn-from-book/actions/workflows/compat.yml/badge.svg)](https://github.com/noine32/learn-from-book/actions/workflows/compat.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)

**日本語** | [English](./README.en.md)

AIコーディングエージェントのための「体験的」学習パイプライン。技術書を読み、
**各テクニックを実装し、テストを実行して検証し、そのうえで初めて再利用可能なスキルとして蓄積する**。
「読んだ」で止めず「理解したことを検証した」まで到達することを狙う。

中核は**客観的な検証ハーネス**（`src/verify.ts`）。あるテクニックが `verified` になるのは、
そのテストが (a) 実装を import し、(b) 最低1つの assertion を持ち、
(c) **実装をミューテーション（各 export を例外を投げるスタブに置換）すると失敗する**
——この3条件をすべて満たしたときだけ。これにより、コードを実際に動かさなくても通ってしまう
トートロジー／echo テストを棄却する。

🔎 **ライブデモ（ショーケース）:** https://noine32.github.io/learn-from-book/

## ⚠️ 安全性: 生成コードは実行前にレビューする

本ツールは、書籍のテクニックからエージェントが生成したコードを実行する。テクニックごとの作業
ディレクトリは**ディレクトリ分離であって実行分離ではない**——生成された Node／テストコードは
あなたのユーザー権限で動き、ネットワーク・環境変数・ファイルシステムにアクセスできる。
**実行前に生成コードをレビューすること。** ネットワーク制限された環境と、許可リスト方式の
パッケージ構成を推奨する。

## このリポジトリに含むもの／含まないもの

- **含む（公開）:** オーケストレーター skill（`skills/learn-from-book/SKILL.md`）、検証ハーネスと
  ランタイムアダプタ（`src/`）、テスト、自作の著作権フリーなデモ（`demo/`）。
- **絶対に含めない（非公開のまま）:** 書籍PDFやその本文、書籍から学んだテクニックごとの
  skill／知識（二次的著作物になりうる）、あなたの `learning-lab/` 出力。これらは git-ignore 済み。

## 必要環境

- Node 22+
- `npm install`

## 使い方

```bash
npm install
npm test                                  # ハーネス自身のテストスイートを実行

# テクニックのディレクトリを1つ検証（ランタイムは自動判定）
npx tsx src/cli.ts demo/debounce      # node テクニック（impl.ts + impl.test.ts）
npx tsx src/cli.ts demo/py-fib        # Python テクニック（impl.py + test_impl.py）, pytest
npx tsx src/cli.ts demo/vba-reverse   # VBA テクニック（impl.bas + cases.json）, Windows/Excel のみ
```

`src/cli.ts` は `VerifyResult` の JSON を出力し、`verified` なら終了コード 0、そうでなければ 1 を返す。

テクニックのテストは §6 のルール（`skills/learn-from-book/SKILL.md` 参照）に従う必要がある:
`./impl` を import し、最低1回 assert し、実装を実際に動かすこと（ハーネスは実装をミューテーション
して、テストがそこで失敗することを要求する）。

## デモ

3つ以上のランタイム（Node/TypeScript, Python/pytest, Go, Rust, Excel/VBA）にわたる検証済み
テクニックは [`docs/DEMO.md`](docs/DEMO.md) を参照。いずれも**実行によって検証**されている。

## Claude Code プラグインとして導入

オーケストレーター skill は `skills/learn-from-book/SKILL.md` にある。本リポジトリを
単一プラグインのマーケットプレイスとして追加できる:

```
/plugin marketplace add noine32/learn-from-book
/plugin install learn-from-book@learn-from-book
```

## ステータス

- **Node ランタイム:** 動作。
- **Python ランタイム:** 動作——`test_impl.py` を pytest で実行し、同じミューテーションベースの
  ネガティブサニティチェックを適用。
- **Go ランタイム:** 動作——`go test` で実行し、関数本体を `panic("MUTATED")` に置換して検証。
- **Rust ランタイム:** 動作——`cargo test` で実行し、`pub fn` 本体を `panic!("MUTATED")` に置換して検証。
- **Excel/VBA ランタイム（Windows 専用）:** 動作——COM で新しい Excel インスタンスに `.bas` を注入し、
  `Application.Run` でケースを実行し、同じミューテーションベースのネガティブサニティチェックを適用。
  自分が起動した Excel インスタンスだけをクリーンアップする。

## ライセンス

MIT

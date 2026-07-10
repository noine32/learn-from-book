# デモ: 検証済みテクニック

**日本語** | [English](./DEMO.en.md)

<!-- このファイルは docs/demos.json から scripts/gen-demo.mjs で生成しています。手で編集せず `npm run gen:demo` を実行してください。 -->

以下の各テクニックは `learn-from-book` の検証ハーネス（node は `src/verify.ts`、VBA は
`src/adapters/run.ps1`）を通している。「検証済み(Verified)」とは、テクニックのテストが**成功**し、
かつ §6 チェックを生き延びたことを意味する: 実装を import・使用し、assertion を持ち、
**実装をミューテーションすると失敗する**（＝トートロジー／echo テストは棄却される）。

ここにある実装はすべて**独立に書き起こしたもの**（普遍的なアルゴリズムとイディオム）。
JavaScript のテクニックは公開資料でも扱われる概念を再現している——高階関数は
*Eloquent JavaScript*（CC BY-NC）、古典的アルゴリズムは *javascript-algorithms*（MIT）の
スタイル——が、書籍／出典の本文やコードは一切コピーしていない。VBA は標準的な Excel イディオム。

## Node ランタイム（`impl.ts` + `impl.test.ts`）

| テクニック | 内容 | 検証 |
|-----------|--------------|----------|
| `demo/debounce` | debounce(fn, wait): 静かになってから一度だけ実行 | ✅ |
| `demo/js-every` | every(arr, pred): 全要素が述語を満たすか | ✅ |
| `demo/js-flatten` | flatten(arrays): ネストを1段ぶん連結 | ✅ |
| `demo/js-range` | range(start, end, step): 刻み付きの数列（両端含む） | ✅ |
| `demo/js-deep-equal` | deepEqual(a, b): 値による構造的等価 | ✅ |
| `demo/js-binary-search` | binarySearch(sorted, target): 位置、無ければ -1 | ✅ |
| `demo/js-gcd` | gcd(a, b): 最大公約数（ユークリッド） | ✅ |
| `demo/js-is-palindrome` | isPalindrome(s): 大小・記号を無視した回文判定 | ✅ |
| `demo/js-memoize` | memoize(fn): 引数ごとに結果をキャッシュ | ✅ |

```bash
npx tsx src/cli.ts demo/js-deep-equal
```

## Python ランタイム（`impl.py` + `test_impl.py`, pytest で検証）

| テクニック | 内容 | 検証 |
|-----------|--------------|----------|
| `demo/py-anagram` | is_anagram(a, b): 大小無視のアナグラム判定 | ✅ |
| `demo/py-word-frequency` | word_frequency(text): 単語→出現数の dict | ✅ |
| `demo/py-fib` | fib(n): n番目のフィボナッチ（反復） | ✅ |
| `demo/py-collatz` | collatz(n): 1に到達するまでの手数 | ✅ |
| `demo/py-comma-code` | comma_code(items): 「a, b, and c」に整形 | ✅ |
| `demo/py-caesar` | caesar(text, shift): シーザー暗号 | ✅ |

```bash
npx tsx src/cli.ts demo/py-fib
```

## Go ランタイム（`go.mod` + `impl.go` + `impl_test.go`, `go test` で検証）

| テクニック | 内容 | 検証 |
|-----------|--------------|----------|
| `demo/go-reverse` | ReverseString(s): UTF‑8 文字列を反転 | ✅ |
| `demo/go-sum` | Sum(nums): int スライスの合計 | ✅ |

```bash
npx tsx src/cli.ts demo/go-sum
```

## Rust ランタイム（`Cargo.toml` + `src/lib.rs` + `tests/integration.rs`, `cargo test` で検証）

| テクニック | 内容 | 検証 |
|-----------|--------------|----------|
| `demo/rust-reverse` | reverse_string(s): 文字列を反転 | ✅ |
| `demo/rust-sum` | sum(nums): i32 スライスの合計 | ✅ |

```bash
npx tsx src/cli.ts demo/rust-sum
```

## Excel/VBA ランタイム（Windows 専用; `impl.bas` + `cases.json`）

| テクニック | 内容 | 検証 |
|-----------|--------------|----------|
| `demo/vba-reverse` | ReverseString(s): 文字列を反転（純粋関数） | ✅ |
| `demo/vba-get-end-row` | GetEndRow(startCell): 列の最終データ行（Range + ワークシート事前設定） | ✅ |
| `demo/vba-sort-array` | SortArray1D(arr): 昇順ソート（Variant 配列 in/out） | ✅ |
| `demo/vba-unique-array` | UniqueArray1D(arr): 重複除去・初出順（Variant 配列 in/out） | ✅ |
| `demo/vba-sum-matrix` | SumMatrix(arr2d): 全セルの総和（2‑D Variant 配列 in） | ✅ |
| `demo/vba-double-range` | DoubleRange(rng): 各セルを2倍（Sub の副作用、期待セル状態で検証） | ✅ |

VBA ランナーは `.bas` を新しい Excel インスタンスに注入し、各ケースを `Application.Run`
（セル fixture / Range 引数 / 配列引数つき）で実行し、結果を照合し、ミューテーション
ベースのネガティブサニティチェックを適用し、自分が起動した Excel インスタンスだけを
クリーンアップする。

## カバレッジ

これらのデモは5つのランタイム（Node/TypeScript, Python/pytest, Go, Rust, Excel/VBA）と、
複数のテクニック形状——純粋関数、高階関数、ワークシート/Range 操作、1‑D / 2‑D 配列 in/out——
にわたる。いずれも要約ではなく**実行によって検証**されている。

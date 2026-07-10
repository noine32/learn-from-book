# Demo: verified techniques

[日本語](./DEMO.md) | **English**

Each technique below was run through `learn-from-book`'s verification harness
(`src/verify.ts` for node, `src/adapters/run.ps1` for VBA). "Verified" means the
technique's test **passed** AND survived the §6 checks: it imports/exercises the
implementation, has assertions, and **fails when the implementation is mutated**
(so tautological / echo tests are rejected).

All implementations here are **independently authored** (universal algorithms and
idioms). The JavaScript techniques reproduce concepts covered by open resources —
higher-order functions from *Eloquent JavaScript* (CC BY-NC) and classic algorithms
in the style of *javascript-algorithms* (MIT) — but no book/source text or code is
copied. VBA techniques are standard Excel idioms.

## Node runtime (`impl.ts` + `impl.test.ts`)

| Technique | What it does | Verified |
|-----------|--------------|----------|
| `demo/debounce` | debounce(fn, wait): fire once after the quiet window | ✅ |
| `demo/js-every` | every(arr, pred): all elements satisfy a predicate | ✅ |
| `demo/js-flatten` | flatten(arrays): concatenate one level of nesting | ✅ |
| `demo/js-range` | range(start, end, step): inclusive numeric sequence | ✅ |
| `demo/js-deep-equal` | deepEqual(a, b): structural equality by value | ✅ |
| `demo/js-binary-search` | binarySearch(sorted, target): index or -1 | ✅ |
| `demo/js-gcd` | gcd(a, b): greatest common divisor (Euclid) | ✅ |
| `demo/js-is-palindrome` | isPalindrome(s): case/punctuation-insensitive | ✅ |
| `demo/js-memoize` | memoize(fn): cache results per argument | ✅ |

Run any of them:

```bash
npx tsx src/cli.ts demo/js-deep-equal
```

## Python runtime (`impl.py` + `test_impl.py`, verified with pytest)

| Technique | What it does | Verified |
|-----------|--------------|----------|
| `demo/py-anagram` | is_anagram(a, b): case-insensitive anagram check | ✅ |
| `demo/py-word-frequency` | word_frequency(text): word → count dict | ✅ |
| `demo/py-fib` | fib(n): nth Fibonacci number (iterative) | ✅ |
| `demo/py-collatz` | collatz(n): steps to reach 1 | ✅ |
| `demo/py-comma-code` | comma_code(items): "a, b, and c" | ✅ |
| `demo/py-caesar` | caesar(text, shift): Caesar cipher | ✅ |

```bash
npx tsx src/cli.ts demo/py-fib
```

## Go runtime (`go.mod` + `impl.go` + `impl_test.go`, verified with `go test`)

| Technique | What it does | Verified |
|-----------|--------------|----------|
| `demo/go-reverse` | ReverseString(s): reverse a UTF‑8 string | ✅ |
| `demo/go-sum` | Sum(nums): sum of an int slice | ✅ |

```bash
npx tsx src/cli.ts demo/go-sum
```

## Rust runtime (`Cargo.toml` + `src/lib.rs` + `tests/integration.rs`, verified with `cargo test`)

| Technique | What it does | Verified |
|-----------|--------------|----------|
| `demo/rust-reverse` | reverse_string(s): reverse a string | ✅ |
| `demo/rust-sum` | sum(nums): sum of an i32 slice | ✅ |

```bash
npx tsx src/cli.ts demo/rust-sum
```

## Excel/VBA runtime (Windows-only; `impl.bas` + `cases.json`)

| Technique | What it does | Verified |
|-----------|--------------|----------|
| `demo/vba-reverse` | ReverseString(s): reverse a string (pure function) | ✅ |
| `demo/vba-get-end-row` | GetEndRow(startCell): last data row in a column (Range + worksheet setup) | ✅ |
| `demo/vba-sort-array` | SortArray1D(arr): ascending sort (Variant array in/out) | ✅ |
| `demo/vba-unique-array` | UniqueArray1D(arr): distinct values, first-seen order (Variant array in/out) | ✅ |
| `demo/vba-sum-matrix` | SumMatrix(arr2d): sum of all cells (2‑D Variant array in) | ✅ |
| `demo/vba-double-range` | DoubleRange(rng): double each cell in place (Sub side effect, verified via expected cell state) | ✅ |

The VBA runner injects the `.bas` into a fresh Excel instance, runs each case via
`Application.Run` (with cell fixtures / Range args / array args), checks results,
applies the mutation-based negative-sanity check, and cleans up only its own
Excel instance.

## Coverage

These demos span five runtimes (Node/TypeScript, Python/pytest, Go, Rust, Excel/VBA) and
several technique shapes: pure functions, higher‑order functions, worksheet/Range
operations, and 1‑D / 2‑D array in/out — each verified by execution rather than by
summary.

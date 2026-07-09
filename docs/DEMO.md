# Demo: verified techniques

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

```bash
npx tsx src/cli.ts demo/py-fib
```

## Excel/VBA runtime (Windows-only; `impl.bas` + `cases.json`)

| Technique | What it does | Verified |
|-----------|--------------|----------|
| `demo/vba-reverse` | ReverseString(s): reverse a string (pure function) | ✅ |
| `demo/vba-get-end-row` | GetEndRow(startCell): last data row in a column (Range + worksheet setup) | ✅ |
| `demo/vba-sort-array` | SortArray1D(arr): ascending sort (Variant array in/out) | ✅ |
| `demo/vba-unique-array` | UniqueArray1D(arr): distinct values, first-seen order (Variant array in/out) | ✅ |

The VBA runner injects the `.bas` into a fresh Excel instance, runs each case via
`Application.Run` (with cell fixtures / Range args / array args), checks results,
applies the mutation-based negative-sanity check, and cleans up only its own
Excel instance.

## Coverage

These demos exercise four technique shapes the harness supports:
pure functions, worksheet/Range operations, 1‑D array in/out, and higher‑order
functions — each verified by execution rather than by summary.

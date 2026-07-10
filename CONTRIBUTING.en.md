# Contributing

[日本語](./CONTRIBUTING.md) | **English**

Thanks for your interest! This project verifies learned techniques by **executing**
them, so contributions center on adding techniques or runtimes.

## Setup

```bash
npm install          # Node 22+
npm run test:node    # node + python tests (fast; no Excel needed)
npm test             # full suite (adds Excel/VBA tests on Windows)
npm run typecheck
```

Python demos need `pytest` (`pip install pytest`). Excel/VBA demos need Windows +
Excel with "Trust access to the VBA project object model" enabled.

## Adding a technique (demo)

Create a directory under `demo/<name>/` matching a runtime:

- **Node:** `impl.ts` + `impl.test.ts` (vitest). The test must `import './impl'` and assert real behavior.
- **Python:** `impl.py` + `test_impl.py` (pytest). The test must `from impl import ...`.
- **Go:** `go.mod` + `impl.go` + `impl_test.go` (`go test`).
- **Rust:** `Cargo.toml` + `src/lib.rs` + `tests/integration.rs` (`cargo test`).
- **Excel/VBA:** `impl.bas` + `cases.json` (see `skills/learn-from-book/SKILL.md` for the schema).

Verify it:

```bash
npx tsx src/cli.ts demo/<name>
```

`verified` requires the §6 checks (see `skills/learn-from-book/SKILL.md`): the test
imports/exercises the implementation, has assertions, and **fails when the
implementation is mutated** (so tautological/echo tests are rejected).

## Rules

- Implementations must be **independently authored**. Do not copy book/source text or code.
- `src/adapters/run.ps1` must stay **ASCII-only** (a guard test enforces this — Windows PowerShell misreads non-ASCII).
- Keep secrets and personal paths out of the repo; do not commit book PDFs (`.gitignore` covers `learning-lab/`, `*.pdf`, `books/`).
- Add a test so CI (or the local suite) covers the new technique.

## Adding a runtime

Add `src/adapters/<runtime>.ts` exposing `verify<Runtime>Technique(dir)` returning a
`VerifyResult`, mirror the node/python adapters (positive run + mutation-based
negative-sanity), detect it in `src/cli.ts`, and add a gated test.

## About languages

This repository uses **Japanese as its base language** and provides English as
multi-language support (`README.md` / `README.en.md`, `docs/DEMO.md` / `docs/DEMO.en.md`,
etc.). When updating docs, please update both the Japanese and English versions where
possible (one side is fine too — note it in your PR and the other side will follow).

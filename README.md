# learn-from-book

An experiential learning pipeline for AI coding agents: read a programming book,
**implement each technique, verify it by running a test, and only then accumulate it**
as a reusable skill. The goal is to move past "I read it" to "I verified I understand it."

The core is an **objective verification harness** (`src/verify.ts`): a technique is
`verified` only if its test (a) imports the implementation, (b) has at least one
assertion, and (c) **fails when the implementation is mutated** (every export replaced
with a throwing stub). This rejects tautological / echo tests that pass without actually
exercising the code.

## ⚠️ Safety: review generated code before running

This tool runs code that an agent generates from book techniques. The per-technique
work directory is **directory-isolated, not execution-isolated** — generated Node/test
code runs with your user permissions and can access the network, environment variables,
and filesystem. **Review generated code before running it.** Prefer a network-restricted
environment and an allow-listed set of packages.

## What is / isn't in this repo

- **In (public):** the orchestrator skill (`SKILL.md`), the verification harness and
  runtime adapters (`src/`), tests, and a self-authored copyright-free demo (`demo/`).
- **Never in (keep private):** book PDFs or their text, the per-technique skills/knowledge
  learned from a book (they can be derivative works), and your `learning-lab/` outputs.
  These are git-ignored.

## Requirements

- Node 22+
- `npm install`

## Usage

```bash
npm install
npm test                                  # run the harness's own test suite

# verify one technique directory (runtime auto-detected)
npx tsx src/cli.ts demo/debounce      # node technique (impl.ts + impl.test.ts)
npx tsx src/cli.ts demo/py-fib        # Python technique (impl.py + test_impl.py), pytest
npx tsx src/cli.ts demo/vba-reverse   # VBA technique (impl.bas + cases.json), Windows/Excel only
```

`src/cli.ts` prints a `VerifyResult` JSON and exits 0 when `verified`, 1 otherwise.

A technique's test must follow the §6 rules (see `SKILL.md`): import `./impl`, assert at
least once, and genuinely exercise the implementation (the harness mutates the impl and
requires the test to then fail).

## Demos

See [`docs/DEMO.md`](docs/DEMO.md) for verified techniques across both runtimes
(higher-order JS functions and Excel/VBA utilities), each verified by execution.

## Status

- **Node runtime:** working.
- **Python runtime:** working — runs `test_impl.py` with pytest and applies the same mutation-based negative-sanity check.
- **Excel/VBA runtime (Windows-only):** working — injects a `.bas` into a fresh Excel
  instance via COM, runs cases with `Application.Run`, and applies the same
  mutation-based negative-sanity check. Cleans up only its own Excel instance.

## License

MIT

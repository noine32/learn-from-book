// docs/demos.json（唯一の source of truth）から docs/DEMO.md（日本語）と
// docs/DEMO.en.md（英語）を生成する。手で DEMO.md を編集せず、demos.json を編集して
// `npm run gen:demo` を実行する（demo-docs ワークフローがドリフトを検知して PR を落とす）。
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const data = JSON.parse(readFileSync(join(root, 'docs', 'demos.json'), 'utf8'));

const GENERATED_NOTE = {
  ja: '<!-- このファイルは docs/demos.json から scripts/gen-demo.mjs で生成しています。手で編集せず `npm run gen:demo` を実行してください。 -->',
  en: '<!-- This file is generated from docs/demos.json by scripts/gen-demo.mjs. Do not edit by hand; run `npm run gen:demo`. -->',
};

const PROSE = {
  ja: {
    title: '# デモ: 検証済みテクニック',
    switcher: '**日本語** | [English](./DEMO.en.md)',
    intro: [
      '以下の各テクニックは `learn-from-book` の検証ハーネス（node は `src/verify.ts`、VBA は',
      '`src/adapters/run.ps1`）を通している。「検証済み(Verified)」とは、テクニックのテストが**成功**し、',
      'かつ §6 チェックを生き延びたことを意味する: 実装を import・使用し、assertion を持ち、',
      '**実装をミューテーションすると失敗する**（＝トートロジー／echo テストは棄却される）。',
      '',
      'ここにある実装はすべて**独立に書き起こしたもの**（普遍的なアルゴリズムとイディオム）。',
      'JavaScript のテクニックは公開資料でも扱われる概念を再現している——高階関数は',
      '*Eloquent JavaScript*（CC BY-NC）、古典的アルゴリズムは *javascript-algorithms*（MIT）の',
      'スタイル——が、書籍／出典の本文やコードは一切コピーしていない。VBA は標準的な Excel イディオム。',
    ].join('\n'),
    tableHead: '| テクニック | 内容 | 検証 |\n|-----------|--------------|----------|',
    vbaProse: [
      'VBA ランナーは `.bas` を新しい Excel インスタンスに注入し、各ケースを `Application.Run`',
      '（セル fixture / Range 引数 / 配列引数つき）で実行し、結果を照合し、ミューテーション',
      'ベースのネガティブサニティチェックを適用し、自分が起動した Excel インスタンスだけを',
      'クリーンアップする。',
    ].join('\n'),
    coverage: [
      '## カバレッジ',
      '',
      'これらのデモは5つのランタイム（Node/TypeScript, Python/pytest, Go, Rust, Excel/VBA）と、',
      '複数のテクニック形状——純粋関数、高階関数、ワークシート/Range 操作、1‑D / 2‑D 配列 in/out——',
      'にわたる。いずれも要約ではなく**実行によって検証**されている。',
    ].join('\n'),
    title_key: 'title_ja',
    what_key: 'what_ja',
  },
  en: {
    title: '# Demo: verified techniques',
    switcher: '[日本語](./DEMO.md) | **English**',
    intro: [
      "Each technique below was run through `learn-from-book`'s verification harness",
      '(`src/verify.ts` for node, `src/adapters/run.ps1` for VBA). "Verified" means the',
      "technique's test **passed** AND survived the §6 checks: it imports/exercises the",
      'implementation, has assertions, and **fails when the implementation is mutated**',
      '(so tautological / echo tests are rejected).',
      '',
      'All implementations here are **independently authored** (universal algorithms and',
      'idioms). The JavaScript techniques reproduce concepts covered by open resources —',
      'higher-order functions from *Eloquent JavaScript* (CC BY-NC) and classic algorithms',
      'in the style of *javascript-algorithms* (MIT) — but no book/source text or code is',
      'copied. VBA techniques are standard Excel idioms.',
    ].join('\n'),
    tableHead: '| Technique | What it does | Verified |\n|-----------|--------------|----------|',
    vbaProse: [
      'The VBA runner injects the `.bas` into a fresh Excel instance, runs each case via',
      '`Application.Run` (with cell fixtures / Range args / array args), checks results,',
      'applies the mutation-based negative-sanity check, and cleans up only its own',
      'Excel instance.',
    ].join('\n'),
    coverage: [
      '## Coverage',
      '',
      'These demos span five runtimes (Node/TypeScript, Python/pytest, Go, Rust, Excel/VBA) and',
      'several technique shapes: pure functions, higher‑order functions, worksheet/Range',
      'operations, and 1‑D / 2‑D array in/out — each verified by execution rather than by',
      'summary.',
    ].join('\n'),
    title_key: 'title_en',
    what_key: 'what_en',
  },
};

function render(lang) {
  const p = PROSE[lang];
  const out = [];
  out.push(p.title, '', p.switcher, '', GENERATED_NOTE[lang], '', p.intro, '');

  for (const rt of data.runtimes) {
    const demos = data.demos.filter((d) => d.runtime === rt.id);
    if (demos.length === 0) continue;
    out.push(`## ${rt[p.title_key]}`, '');
    out.push(p.tableHead);
    for (const d of demos) {
      out.push(`| \`${d.dir}\` | ${d[p.what_key]} | ✅ |`);
    }
    out.push('');
    if (rt.run_example) {
      out.push('```bash', `npx tsx src/cli.ts ${rt.run_example}`, '```', '');
    }
    if (rt.id === 'vba') {
      out.push(p.vbaProse, '');
    }
  }
  out.push(p.coverage, '');
  return out.join('\n');
}

writeFileSync(join(root, 'docs', 'DEMO.md'), render('ja'));
writeFileSync(join(root, 'docs', 'DEMO.en.md'), render('en'));
console.log('generated docs/DEMO.md and docs/DEMO.en.md from docs/demos.json');

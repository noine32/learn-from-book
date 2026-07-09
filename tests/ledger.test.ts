import { describe, it, expect } from 'vitest';
import { normalizeName, dedupKey, dedupe, canTransition } from '../src/ledger.ts';
import type { Technique } from '../src/types.ts';

const mk = (name: string): Technique => ({
  id: name,
  name,
  source: 'ch1',
  claim: 'c',
  experimentIdea: 'e',
  runtime: 'node',
  dependsOn: [],
  status: 'backlog',
});

describe('normalizeName', () => {
  it('lowercases and strips non-alphanumerics', () => {
    expect(normalizeName('  Async/Await  Pattern! ')).toBe('asyncawaitpattern');
  });
});

describe('dedupKey', () => {
  it('is stable across formatting differences', () => {
    expect(dedupKey({ name: 'Debounce' })).toBe(dedupKey({ name: 'de-bounce' }));
  });
});

describe('dedupe', () => {
  it('keeps first occurrence of a duplicate technique name', () => {
    const out = dedupe([mk('Debounce'), mk('debounce'), mk('Throttle')]);
    expect(out.map((t) => t.name)).toEqual(['Debounce', 'Throttle']);
  });
});

describe('canTransition', () => {
  it('allows verified -> promoted', () => {
    expect(canTransition('verified', 'promoted')).toBe(true);
  });
  it('rejects backlog -> promoted', () => {
    expect(canTransition('backlog', 'promoted')).toBe(false);
  });
  it('allows gate-retry back to experimenting', () => {
    expect(canTransition('gate-retry', 'experimenting')).toBe(true);
  });
});

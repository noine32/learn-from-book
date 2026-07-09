import type { Technique, Status } from './types.ts';

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function dedupKey(t: Pick<Technique, 'name'>): string {
  return normalizeName(t.name);
}

export function dedupe(list: Technique[]): Technique[] {
  const seen = new Set<string>();
  const out: Technique[] = [];
  for (const t of list) {
    const k = dedupKey(t);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

export const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  backlog: ['experimenting', 'skipped'],
  experimenting: ['verified', 'failed', 'skipped'],
  verified: ['promoted', 'rejected', 'gate-retry'],
  failed: ['gate-retry'],
  skipped: ['experimenting'],
  'gate-retry': ['experimenting'],
  promoted: [],
  rejected: ['gate-retry'],
};

export function canTransition(from: Status, to: Status): boolean {
  return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
}

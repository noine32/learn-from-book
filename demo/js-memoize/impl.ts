export function memoize<A, R>(fn: (a: A) => R): (a: A) => R {
  const cache = new Map<A, R>();
  return (a: A): R => {
    if (cache.has(a)) return cache.get(a) as R;
    const r = fn(a);
    cache.set(a, r);
    return r;
  };
}

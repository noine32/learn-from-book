export function flatten<T>(arrays: T[][]): T[] {
  return arrays.reduce((acc, cur) => acc.concat(cur), [] as T[]);
}

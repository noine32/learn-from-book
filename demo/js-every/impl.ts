export function every<T>(arr: T[], pred: (x: T) => boolean): boolean {
  for (const x of arr) {
    if (!pred(x)) return false;
  }
  return true;
}

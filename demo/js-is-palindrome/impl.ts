export function isPalindrome(s: string): boolean {
  const t = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let i = 0;
  let j = t.length - 1;
  while (i < j) {
    if (t[i] !== t[j]) return false;
    i++;
    j--;
  }
  return true;
}

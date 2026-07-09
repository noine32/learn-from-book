import { expect, test, vi } from 'vitest';
import { debounce } from './impl.ts';

test('calls once after the wait window', () => {
  vi.useFakeTimers();
  let calls = 0;
  const d = debounce(() => {
    calls++;
  }, 100);
  d();
  d();
  d();
  expect(calls).toBe(0); // まだ wait を跨いでいない
  vi.advanceTimersByTime(100);
  expect(calls).toBe(1); // 最後の呼び出しから wait 後に一度だけ
  vi.useRealTimers();
});

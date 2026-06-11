// src/__tests__/store.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useUIStore } from '@/lib/store';

test('theme toggles between light and dark', () => {
  const { result } = renderHook(() => useUIStore());
  // initial theme should be light
  expect(result.current.theme).toBe('light');
  // set to dark
  act(() => {
    result.current.setTheme('dark');
  });
  expect(result.current.theme).toBe('dark');
  // back to light
  act(() => {
    result.current.setTheme('light');
  });
  expect(result.current.theme).toBe('light');
});

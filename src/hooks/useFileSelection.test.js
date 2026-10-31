import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFileSelection from './useFileSelection';

const files = [1, 2, 3, 4].map(id => ({ id }));
describe('file selection', () => {
  it('toggles individual files and selects a range from the anchor', () => {
    const { result } = renderHook(() => useFileSelection(files));
    act(() => result.current.select(1, {}));
    act(() => result.current.select(3, { shiftKey: true }));
    expect(result.current.selected).toEqual([1, 2, 3]);
    act(() => result.current.select(2, { ctrlKey: true }));
    expect(result.current.selected).toEqual([1, 3]);
  });
  it('only operates on files currently displayed', () => {
    const { result, rerender } = renderHook(({ list }) => useFileSelection(list), { initialProps: { list: files } });
    act(() => result.current.setIds([1, 2, 3]));
    rerender({ list: [{ id: 3 }] });
    expect(result.current.selected).toEqual([3]);
    act(() => result.current.clear());
    expect(result.current.selected).toEqual([]);
  });
});

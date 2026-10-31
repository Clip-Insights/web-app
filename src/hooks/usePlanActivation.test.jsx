import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchMyPlan } from '../services/planService';
import usePlanActivation from './usePlanActivation';
vi.mock('../services/planService', () => ({fetchMyPlan:vi.fn()}));
const request = vi.fn();
const confirmed = vi.fn();
beforeEach(() => { vi.resetAllMocks(); vi.useFakeTimers(); sessionStorage.clear(); });
afterEach(() => vi.useRealTimers());
describe('payment activation', () => {
  it('waits for the actual plan and stops polling after confirmation', async () => {
    fetchMyPlan.mockResolvedValueOnce({plan:{slug:'free'}}).mockResolvedValue({plan:{slug:'pro'}});
    const {result}=renderHook(()=>usePlanActivation(request,true,confirmed));
    await act(async()=>result.current.begin('pro'));
    expect(result.current.status).toBe('checking');
    await act(async()=>vi.advanceTimersByTimeAsync(2000));
    expect(result.current.status).toBe('confirmed');
    expect(confirmed).toHaveBeenCalledTimes(1);
    await act(async()=>vi.advanceTimersByTimeAsync(20000));
    expect(fetchMyPlan).toHaveBeenCalledTimes(2);
  });
  it('offers a status retry after a delay instead of assuming activation succeeded', async () => {
    fetchMyPlan.mockResolvedValue({plan:{slug:'free'}});
    const {result,unmount}=renderHook(()=>usePlanActivation(request,true,confirmed));
    await act(async()=>result.current.begin('pro'));
    await act(async()=>vi.advanceTimersByTimeAsync(20000));
    expect(result.current.status).toBe('delayed');
    expect(result.current.pending).toBe(true);
    expect(confirmed).not.toHaveBeenCalled();
    fetchMyPlan.mockResolvedValue({plan:{slug:'pro'}});
    await act(async()=>result.current.retry());
    expect(result.current.status).toBe('confirmed');
    unmount();
  });
  it('cleans up polling when the page is left', async () => {
    fetchMyPlan.mockResolvedValue({plan:{slug:'free'}});
    const {result,unmount}=renderHook(()=>usePlanActivation(request,true,confirmed));
    await act(async()=>result.current.begin('pro'));
    unmount();
    await act(async()=>vi.advanceTimersByTimeAsync(20000));
    expect(fetchMyPlan).toHaveBeenCalledTimes(1);
  });
});

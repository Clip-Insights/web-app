import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearPendingPlanSelection, pendingPlanSelection, planDestination, readPlanSelection, rememberPlanSelection, withPlanSelection } from './planSelection';

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

describe('selected plan handoff', () => {
  it('keeps the plan and annual billing across signup and sign-in URLs', () => {
    const selection = readPlanSelection('?plan=pro&billing=annual');
    expect(withPlanSelection('/login', selection)).toBe('/login?plan=pro&billing=annual');
    expect(planDestination(selection)).toBe('/pricing?plan=pro&billing=annual');
  });
  it('rejects redirect-like or invalid plan values and normalizes the billing period', () => {
    expect(readPlanSelection('?plan=https://other.example')).toBeNull();
    expect(readPlanSelection('?plan=guest')).toBeNull();
    expect(readPlanSelection('?plan=pro&billing=unexpected')).toEqual({plan:'pro',billing:'monthly'});
    expect(planDestination(null)).toBe('/');
  });
  it('sends a free account to the dashboard rather than checkout', () => {
    expect(planDestination({plan:'free',billing:'annual'})).toBe('/');
  });
  it('remembers a non-sensitive choice for email verification in a new tab', () => {
    rememberPlanSelection({plan:'premium',billing:'annual'});
    expect(pendingPlanSelection()).toEqual({plan:'premium',billing:'annual'});
    clearPendingPlanSelection();
    expect(pendingPlanSelection()).toBeNull();
  });
  it('expires an old signup choice and ignores corrupted browser data', () => {
    const now = Date.now();
    vi.spyOn(Date,'now').mockReturnValue(now);
    rememberPlanSelection({plan:'pro',billing:'monthly'});
    vi.spyOn(Date,'now').mockReturnValue(now+25*60*60*1000);
    expect(pendingPlanSelection()).toBeNull();
    localStorage.setItem('clipinsights.pending-plan','not JSON');
    expect(pendingPlanSelection()).toBeNull();
  });
});

import { getApiUrl } from './apiService';

/**
 * Plans API. Limit values live on the backend (Django admin) and are fetched,
 * never hardcoded, so the pricing page and usage meters always match what the
 * server actually enforces.
 */

export async function fetchPlans() {
  const response = await fetch(getApiUrl('plans/'));
  if (!response.ok) throw new Error(`Failed to load plans (${response.status})`);
  const data = await response.json();
  return data.plans;
}

/** The logged-in user's plan and live usage. Pass AuthContext's authRequest. */
export async function fetchMyPlan(authRequest) {
  const response = await authRequest({ method: 'get', url: getApiUrl('plans/me/') });
  return response.data;
}

export function formatStorage(mb) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`;
  return `${mb} MB`;
}

/**
 * Phrase for when a plan limit next resets, in the viewer's local timezone
 * (the backend sends `resets_at` as UTC ISO; `Date` converts on parse).
 * Relative within 24 hours — "in about 3 hours" — otherwise the local date
 * and time. Returns null for missing/unparsable input.
 */
export function formatResetTime(isoUtc, nowMs = Date.now()) {
  const resetsAt = new Date(isoUtc ?? NaN);
  if (Number.isNaN(resetsAt.getTime())) return null;
  const diffMs = resetsAt.getTime() - nowMs;
  if (diffMs <= 0) return 'any moment now';
  const minutes = Math.ceil(diffMs / 60_000);
  if (minutes < 60) return `in about ${minutes} minute${minutes === 1 ? '' : 's'}`;
  if (diffMs < 24 * 3_600_000) {
    const hours = Math.round(diffMs / 3_600_000);
    return `in about ${hours} hour${hours === 1 ? '' : 's'}`;
  }
  return `on ${resetsAt.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

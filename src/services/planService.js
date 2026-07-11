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

import { getApiUrl } from './apiService';

/**
 * Billing (Paddle) API. Complements planService: plans/limits come from the
 * plans app; this service covers purchase metadata, checkout and the user's
 * Paddle subscription. Authenticated calls take AuthContext's `authRequest`
 * (which refreshes expired tokens), matching the planService pattern.
 */

/** Purchase metadata per plan slug: annual price + Paddle price ids. */
export async function fetchBillingCatalog() {
  const response = await fetch(getApiUrl('billing/catalog/'));
  if (!response.ok) throw new Error(`Failed to load billing catalog (${response.status})`);
  const data = await response.json();
  return data.catalog;
}

/** The user's Paddle subscription state, or null when they never subscribed. */
export async function fetchSubscription(authRequest) {
  const response = await authRequest({ method: 'get', url: getApiUrl('billing/subscription/') });
  return response.data.subscription;
}

/** Everything Paddle.js needs to open the overlay checkout for a plan. */
export async function createCheckout(authRequest, planSlug, billingCycle) {
  const response = await authRequest({
    method: 'post',
    url: getApiUrl('billing/checkout/'),
    data: { plan_code: planSlug, billing_cycle: billingCycle },
  });
  return response.data;
}

/** Schedule cancellation at the end of the current billing period. */
export async function cancelSubscription(authRequest) {
  const response = await authRequest({ method: 'post', url: getApiUrl('billing/cancel/') });
  return response.data;
}

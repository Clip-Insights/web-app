import { decryptToken, getApiUrl } from "./apiService";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${decryptToken(localStorage.getItem("access"))}`,
});

// Public plan catalogue (limits, prices) — plans app.
export const getPlans = async () => {
  const response = await fetch(getApiUrl("plans/"));
  if (!response.ok) throw new Error(`Failed to load plans (${response.status})`);
  return (await response.json()).plans;
};

// Purchase metadata (annual prices, which plans are buyable) — billing app.
export const getBillingCatalog = async () => {
  const response = await fetch(getApiUrl("billing/catalog/"));
  if (!response.ok) throw new Error(`Failed to load billing catalog (${response.status})`);
  return (await response.json()).catalog;
};

// The signed-in user's effective plan + live usage counters.
export const getMyPlan = async () => {
  const response = await fetch(getApiUrl("plans/me/"), { headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to load your plan (${response.status})`);
  return response.json();
};

// The signed-in user's Paddle subscription state (may be null).
export const getSubscription = async () => {
  const response = await fetch(getApiUrl("billing/subscription/"), { headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to load subscription (${response.status})`);
  return (await response.json()).subscription;
};

// Returns { environment, client_token, price_id, email, user_id } for Paddle.js
export const createCheckout = async (planSlug, billingCycle) => {
  const response = await fetch(getApiUrl("billing/checkout/"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ plan_code: planSlug, billing_cycle: billingCycle }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not start checkout");
  return data;
};

export const cancelSubscription = async () => {
  const response = await fetch(getApiUrl("billing/cancel/"), {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Cancellation failed");
  return data;
};

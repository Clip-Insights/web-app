import { decryptToken, encryptToken, getApiUrl } from "./apiService";

// Access tokens are short-lived (5 min); refresh-and-retry on 401 like the
// rest of the app does, instead of surfacing "not working" to the user.
const refreshAccessToken = async () => {
  const refresh = decryptToken(localStorage.getItem("refresh"));
  if (!refresh) throw new Error("Please log in again.");
  const response = await fetch(getApiUrl("account/refresh-token/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) throw new Error("Session expired. Please log in again.");
  const data = await response.json();
  localStorage.setItem("access", encryptToken(data.access));
  return data.access;
};

const authFetch = async (url, options = {}) => {
  const attempt = (token) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  let response = await attempt(decryptToken(localStorage.getItem("access")));
  if (response.status === 401) {
    response = await attempt(await refreshAccessToken());
  }
  return response;
};

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
  const response = await authFetch(getApiUrl("plans/me/"));
  if (!response.ok) throw new Error(`Failed to load your plan (${response.status})`);
  return response.json();
};

// The signed-in user's Paddle subscription state (may be null).
export const getSubscription = async () => {
  const response = await authFetch(getApiUrl("billing/subscription/"));
  if (!response.ok) throw new Error(`Failed to load subscription (${response.status})`);
  return (await response.json()).subscription;
};

// Returns { environment, client_token, price_id, email, user_id } for Paddle.js
export const createCheckout = async (planSlug, billingCycle) => {
  const response = await authFetch(getApiUrl("billing/checkout/"), {
    method: "POST",
    body: JSON.stringify({ plan_code: planSlug, billing_cycle: billingCycle }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.detail || "Could not start checkout");
  return data;
};

export const cancelSubscription = async () => {
  const response = await authFetch(getApiUrl("billing/cancel/"), { method: "POST" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.detail || "Cancellation failed");
  return data;
};

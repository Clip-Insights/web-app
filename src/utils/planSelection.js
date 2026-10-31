const PENDING_PLAN_KEY = 'clipinsights.pending-plan';
const PENDING_PLAN_TTL = 24 * 60 * 60 * 1000;

export function readPlanSelection(search) {
  const params = new URLSearchParams(search);
  const plan = params.get('plan');
  if (!plan || plan === 'guest' || !/^[a-z0-9-]{1,30}$/.test(plan)) return null;
  return { plan, billing: params.get('billing') === 'annual' ? 'annual' : 'monthly' };
}

export function withPlanSelection(path, selection) {
  if (!selection) return path;
  return `${path}?${new URLSearchParams(selection)}`;
}

export function planDestination(selection) {
  return selection && selection.plan !== 'free' ? withPlanSelection('/pricing', selection) : '/';
}

// Email verification can open a new tab without the signup URL's query string.
export function rememberPlanSelection(selection) {
  if (!selection) return;
  try { localStorage.setItem(PENDING_PLAN_KEY, JSON.stringify({ ...selection, savedAt: Date.now() })); }
  catch { /* The URL still preserves the choice when browser storage is disabled. */ }
}

export function pendingPlanSelection() {
  try {
    const saved = JSON.parse(localStorage.getItem(PENDING_PLAN_KEY));
    if (!saved || typeof saved.plan !== "string" || !["monthly", "annual"].includes(saved.billing) || !Number.isFinite(saved.savedAt) || Date.now() - saved.savedAt > PENDING_PLAN_TTL || saved.savedAt > Date.now()) return null;
    return readPlanSelection(new URLSearchParams({ plan: saved.plan, billing: saved.billing }).toString());
  } catch { return null; }
}

export function clearPendingPlanSelection() {
  try { localStorage.removeItem(PENDING_PLAN_KEY); }
  catch { /* Expiration also prevents an old choice from being reused. */ }
}

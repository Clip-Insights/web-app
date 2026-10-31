import { PricingSkeleton, Skeleton } from '../../components/Loading/Skeletons';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { readPlanSelection, withPlanSelection } from '../../utils/planSelection';
import { toast } from 'react-toastify';
import Notice from '../../components/Feedback/Notice';
import usePlanActivation from '../../hooks/usePlanActivation';
import { Check, NotebookPen, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyPlan, fetchPlans, formatStorage } from '../../services/planService';
import {
  cancelSubscription,
  createCheckout,
  fetchBillingCatalog,
  fetchSubscription,
} from '../../services/billingService';
import { openCheckout } from '../../services/paddle';

/**
 * Every number on this page is fetched from the backend plan catalogue —
 * the same rows the API enforces — so pricing can never drift from reality.
 * Paid plans check out through Paddle (overlay); the plan activates when the
 * subscription webhook lands.
 */

const PAID_CTA_NOTE = 'Checkout is on its way — paid plans open soon.';

function limitRows(plan) {
  return [
    { label: 'AI summaries + key points', value: `${plan.daily_summaries} / day` },
    { label: 'AI chat messages', value: `${plan.daily_chat_messages} / day` },
    { label: 'Video context per request', value: `${(plan.transcript_token_budget / 1000).toFixed(0)}k tokens` },
    { label: 'Cloud storage for PDFs', value: formatStorage(plan.storage_limit_mb) },
    { label: 'Largest single file', value: formatStorage(plan.max_file_size_mb) },
    { label: 'Note length', value: `${plan.max_note_chars.toLocaleString()} characters` },
    { label: 'Notes per video', value: plan.max_notes_per_video.toLocaleString() },
    { label: 'Screenshots per video', value: plan.max_screenshots_per_video.toLocaleString() },
  ];
}

function PlanCard({
  plan,
  purchase,
  cycle,
  highlighted,
  currentSlug,
  isAuthenticated,
  subscription,
  busy,
  detailsLoading = false,
  accountError = false,
  cancelBusy = false,
  checkoutPending = false,
  selected = false,
  onUpgrade,
  onCancel,
}) {
  const isCurrent = currentSlug === plan.slug;
  const isPaid = plan.monthly_price_usd > 0;
  const monthly = Number(plan.monthly_price_usd);
  const annual = purchase ? Number(purchase.annual_price_usd) : null;
  const showAnnual = cycle === 'annual' && isPaid && annual;
  const shownPrice = showAnnual ? annual / 12 : monthly;
  // Paid plans are purchasable only once the backend has synced them to Paddle.
  const purchasable = isPaid && Boolean(cycle === 'annual' ? purchase?.paddle_price_id_annual : purchase?.paddle_price_id_monthly);
  const savings = annual > 0 && monthly > 0 ? Math.max(0, Math.round((1 - annual / (monthly * 12)) * 100)) : 0;

  return (
    <div
      className={`relative flex flex-col rounded-xl bg-white p-6 sm:p-8 ${
        highlighted
          ? 'border border-auth-accent'
          : 'border border-auth-line'
      }`}
    >
      {highlighted && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-auth-accent text-xs font-semibold text-white"

        >
          For regular learners
        </span>
      )}

      <span className="text-xs font-semibold uppercase tracking-widest text-auth-muted">{plan.name}</span>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-auth-ink">
          {isPaid ? `$${+shownPrice.toFixed(2)}` : '$0'}
        </span>
        <span className="text-sm text-auth-muted">/ month</span>
      </div>
      {showAnnual && (
        <p className="mt-1 text-xs text-auth-muted">Billed ${annual} per year{savings > 0 ? ` · Save ${savings}%` : ''}</p>
      )}
      <p className="mt-2 text-sm text-auth-muted min-h-[40px]">{plan.description}</p>

      <div className="mt-4 mb-6">
        {detailsLoading ? <div role="status" aria-label={`Loading ${plan.name} plan options`}><Skeleton className="h-11 w-full rounded-lg" /></div> : accountError ? <button disabled className="min-h-11 w-full rounded-lg bg-auth-panel text-sm text-auth-muted">Plan status unavailable</button> : isCurrent ? (
          <div>
            <span className="block w-full text-center py-2.5 rounded-lg border border-customPrimary text-auth-accent font-medium text-sm">
              Your current plan
            </span>
            {isPaid && subscription?.status === 'active' && !subscription?.cancel_at_period_end && (
              <button
                onClick={onCancel}
                disabled={cancelBusy || checkoutPending}
                className="mt-2 w-full text-center text-xs text-auth-muted hover:text-red-500 underline"
              >
                {cancelBusy ? 'Cancelling…' : 'Cancel subscription (keeps access until period end)'}
              </button>
            )}
            {isPaid && subscription?.cancel_at_period_end && (
              <p className="mt-2 text-xs text-center text-amber-600">
                Ends {new Date(subscription.current_period_end).toLocaleDateString()} — will not renew
              </p>
            )}
          </div>
        ) : purchasable ? (
          <button
            onClick={() => onUpgrade(plan)}
            disabled={busy || cancelBusy || checkoutPending}
            className={`block w-full py-2.5 rounded-lg font-medium text-sm transition-colors text-white ${
              busy
                ? 'bg-gray-300 cursor-wait'
                : 'bg-auth-accent hover:bg-customPrimaryHover'
            }`}
          >
            {busy ? 'Opening checkout…' : selected ? (isAuthenticated ? 'Continue to checkout' : 'Sign in to continue') : `Upgrade to ${plan.name}`}
          </button>
        ) : isPaid ? (
          <button
            disabled
            title={PAID_CTA_NOTE}
            className="block w-full py-2.5 rounded-lg bg-gray-200 text-auth-muted font-medium text-sm cursor-not-allowed"
          >
            Coming soon
          </button>
        ) : (
          <Link
            to="/signup"
            className="block w-full text-center py-2.5 rounded-lg bg-auth-accent hover:bg-customPrimaryHover text-white font-medium text-sm transition-colors"
          >
            {isAuthenticated ? 'Included with your account' : 'Create free account'}
          </Link>
        )}
      </div>

      <ul className="space-y-2.5 text-sm">
        {limitRows(plan).map((row) => (
          <li key={row.label} className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-2 text-auth-muted">
              <Check className="w-4 h-4 text-auth-accent shrink-0" />
              {row.label}
            </span>
            <span className="font-semibold text-auth-ink whitespace-nowrap tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

PlanCard.propTypes = {
  plan: PropTypes.shape({ slug: PropTypes.string, name: PropTypes.string, monthly_price_usd: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), description: PropTypes.string }).isRequired,
  purchase: PropTypes.shape({ annual_price_usd: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), paddle_price_id_annual: PropTypes.string, paddle_price_id_monthly: PropTypes.string }),
  cycle: PropTypes.string.isRequired, highlighted: PropTypes.bool, currentSlug: PropTypes.string,
  detailsLoading: PropTypes.bool, accountError: PropTypes.bool, cancelBusy: PropTypes.bool, checkoutPending: PropTypes.bool,
  selected: PropTypes.bool,
  isAuthenticated: PropTypes.bool, busy: PropTypes.bool, onUpgrade: PropTypes.func.isRequired, onCancel: PropTypes.func.isRequired,
  subscription: PropTypes.shape({ status: PropTypes.string, cancel_at_period_end: PropTypes.bool, current_period_end: PropTypes.string }),
};

const Pricing = () => {
  const { isAuthenticated, authRequest } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selection = readPlanSelection(searchParams.toString());
  const cycle = searchParams.get('billing') === 'annual' ? 'annual' : 'monthly';
  const setCycle = (value) => {
    const next = new URLSearchParams(searchParams);
    next.set('billing', value);
    setSearchParams(next, { replace: true });
  };
  const [plans, setPlans] = useState(null);
  const [catalog, setCatalog] = useState({});
  const [currentSlug, setCurrentSlug] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [busyPlan, setBusyPlan] = useState(null);
  const [error, setError] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [accountLoading, setAccountLoading] = useState(isAuthenticated);
  const [accountError, setAccountError] = useState(false);
  const [billingError, setBillingError] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const refreshMine = useCallback(async (active = () => true) => {
    if (!isAuthenticated) return;
    try {
      const mine = await fetchMyPlan(authRequest);
      if (active()) { setCurrentSlug(mine?.plan?.slug ?? null); setAccountError(false); }
      const nextSubscription = await fetchSubscription(authRequest);
      if (active()) setSubscription(nextSubscription);
    } catch (e) {
      if (active()) setAccountError(true);
      console.error('Failed to load account billing:', e);
    } finally { if (active()) setAccountLoading(false); }
  }, [isAuthenticated, authRequest]);

  useEffect(() => {
    let cancelled = false;
    setError(false); setBillingError(false); setCatalogLoading(true);
    setAccountLoading(isAuthenticated); setAccountError(false);
    fetchPlans()
      .then(value => { if (!cancelled) setPlans(value); })
      .catch(() => { if (!cancelled) setError(true); });
    fetchBillingCatalog()
      .then(value => { if (!cancelled) setCatalog(Object.fromEntries(value.map(item => [item.plan_slug, item]))); })
      .catch(() => { if (!cancelled) setBillingError(true); })
      .finally(() => { if (!cancelled) setCatalogLoading(false); });
    if (isAuthenticated) refreshMine(() => !cancelled);
    else { setCurrentSlug(null); setSubscription(null); }
    return () => { cancelled = true; };
  }, [isAuthenticated, refreshMine, attempt]);

  const activation = usePlanActivation(authRequest, isAuthenticated, refreshMine);
  const handleUpgrade = async (plan) => {
    if (busyPlan || cancelBusy || activation.pending) return;
    if (!isAuthenticated) {
      navigate(withPlanSelection('/login', { plan: plan.slug, billing: cycle }));
      return;
    }
    setBusyPlan(plan.slug);
    setCheckoutError('');
    try {
      const config = await createCheckout(authRequest, plan.slug, cycle);
      await openCheckout(config, {
        onSuccess: () => {
          activation.begin(plan.slug);
        },
        onError: () => setCheckoutError('Checkout couldn’t complete. Check your payment status before trying again, or contact support if you were charged.'),
      });
    } catch (e) {
      setCheckoutError(e.response?.data?.error || e.response?.data?.detail || e.message || 'Could not start checkout. Please try again.');
    } finally {
      setBusyPlan(null);
    }
  };

  const handleCancel = async () => {
    if (cancelBusy || busyPlan) return;
    setCancelBusy(true);
    try {
      const result = await cancelSubscription(authRequest);
      toast.success(result.msg || 'Subscription will end at the current period.');
      await refreshMine();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Cancellation failed. Try again.');
    } finally { setCancelBusy(false); }
  };

  const guest = plans?.find((p) => p.slug === 'guest');
  const selectedPlan = plans?.find(plan => plan.slug === selection?.plan && plan.slug !== 'guest');
  const purchasable = selectedPlan ? [selectedPlan] : plans?.filter((p) => p.slug !== 'guest') ?? [];
  const hasPurchases = Object.keys(catalog).length > 0;

  return (
    <div className="mx-auto max-w-7xl">

      <div className="mb-6 flex min-h-16 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0"><h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-auth-ink">{selectedPlan ? `Your ${selectedPlan.name} plan` : 'A plan for the way you learn.'}</h1>
        <p className="mt-2 text-sm text-auth-muted">
          {selectedPlan ? 'Review your selection. Checkout opens only when you choose to continue.' : 'Keep your essentials free, or choose more AI usage and storage.'}
        </p></div>

        {catalogLoading ? <div role="status" aria-label="Loading billing options"><Skeleton className="h-12 w-48 rounded-full" /></div> : hasPurchases && (
          <div className="inline-flex w-fit shrink-0 items-center rounded-full border border-auth-line bg-auth-panel p-1">
            {['monthly', 'annual'].map((option) => (
              <button
                key={option}
                aria-pressed={cycle === option}
                onClick={() => setCycle(option)}
                className={`min-h-11 rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent ${
                  cycle === option ? 'bg-white shadow text-gray-900' : 'text-auth-muted'
                }`}
              >
                {option === 'monthly' ? 'Monthly' : 'Annual'}
                {option === 'annual' && (
                  <span className="sr-only">billing</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPlan && <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-sm"><p className="text-auth-muted">{isAuthenticated ? 'Your selection is ready to review below.' : 'Sign in or create an account to continue with this plan.'}</p><div className="flex flex-wrap gap-4">{!isAuthenticated && <Link className="font-semibold text-auth-accent underline underline-offset-4" to={withPlanSelection('/signup', { plan: selectedPlan.slug, billing: cycle })}>Create an account</Link>}<Link className="text-auth-muted underline underline-offset-4" to={`/pricing?billing=${cycle}`}>Compare all plans</Link></div></div>}
      {selection && plans && !selectedPlan && <p role="status" className="mb-6 text-sm text-auth-muted">That plan is no longer available. Choose from the current plans below.</p>}

      {error && (
        <div className="text-center py-16">
          <p className="text-auth-muted">Plans couldn&apos;t be loaded. Check your connection and try again.</p>
          <button
            onClick={() => setAttempt(value => value + 1)}
            className="mt-4 px-4 py-2 rounded-lg bg-auth-accent hover:bg-customPrimaryHover text-white text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {checkoutError && <div className="mb-6"><Notice tone="error">{checkoutError}</Notice></div>}
      {activation.status !== 'idle' && <div className="mb-6"><Notice tone={activation.status === 'confirmed' ? 'success' : activation.status === 'error' ? 'error' : 'info'} action={['delayed', 'error'].includes(activation.status) && <div className="flex flex-wrap gap-4"><button type="button" onClick={activation.retry} className="min-h-11 rounded font-medium text-auth-accent">Check plan status</button><a href="https://clipinsights.org/contact" className="inline-flex min-h-11 items-center rounded text-auth-muted underline underline-offset-4">Contact support</a></div>}>{activation.status === 'checking' ? 'Payment received. We’re waiting for your plan to activate. You don’t need to pay again.' : activation.status === 'confirmed' ? 'Your plan is active. Your updated allowances are ready to use.' : activation.status === 'error' ? 'We couldn’t check your plan status. Check your connection and try again before making another payment.' : 'Your payment is taking a little longer to confirm. Check your plan status again in a moment, or contact support. Please don’t pay again.'}</Notice></div>}
      {!plans && !error && <PricingSkeleton />}
      {(billingError || accountError) && !error && <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-auth-line bg-white p-4 text-sm text-auth-muted"><p>Some billing details couldn’t be loaded. Please retry before choosing a plan.</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="min-h-11 rounded-lg border border-auth-line px-4 hover:bg-auth-panel">Retry billing</button></div>}

      {plans && (
        <>
          <div className={selectedPlan ? 'mx-auto w-full max-w-xl' : 'grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch'}>
            {purchasable.map((plan) => (
              <PlanCard
                key={plan.slug}
                plan={plan}
                selected={Boolean(selectedPlan)}
                purchase={catalog[plan.slug]}
                cycle={cycle}
                highlighted={plan.slug === 'pro'}
                currentSlug={currentSlug}
                isAuthenticated={isAuthenticated}
                subscription={currentSlug === plan.slug ? subscription : null}
                busy={busyPlan === plan.slug}
                detailsLoading={catalogLoading || accountLoading}
                accountError={accountError || billingError}
                cancelBusy={cancelBusy}
                checkoutPending={Boolean(busyPlan) || activation.pending}
                onUpgrade={handleUpgrade}
                onCancel={handleCancel}
              />
            ))}
          </div>

          <p className="mt-4 text-xs leading-5 text-auth-muted">AI allowances reset on a rolling 24-hour window. Prices are in USD.</p>

          {guest && !selectedPlan && (
            <div className="mt-6 rounded-xl border border-auth-line bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <NotebookPen className="w-5 h-5 text-auth-accent" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-auth-ink">Just browsing? No account needed.</h2>
                <p className="text-sm text-auth-muted mt-1">
                  Take notes up to {guest.max_note_chars.toLocaleString()} characters ({guest.max_notes_per_video} per
                  video), capture {guest.max_screenshots_per_video} screenshots per video and download your PDF — all
                  in your browser, with no account required. Sign in to use AI within your plan’s limits.
                </p>
              </div>
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-auth-accent hover:text-auth-accentHover whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  Unlock AI free
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Pricing;

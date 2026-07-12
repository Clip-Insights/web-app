import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
  const purchasable = isPaid && purchase;

  return (
    <div
      className={`relative flex flex-col rounded-3xl bg-[#FCFCFF] p-6 sm:p-8 ${
        highlighted
          ? 'border-2 border-customPrimary shadow-lg'
          : 'border border-gray-200'
      }`}
    >
      {highlighted && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(to right, #3E4FFD 0%, #8000BB 100%)' }}
        >
          Most popular
        </span>
      )}

      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{plan.name}</span>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-gray-800">
          {isPaid ? `$${+shownPrice.toFixed(2)}` : '$0'}
        </span>
        <span className="text-sm text-gray-500">/ month</span>
      </div>
      {showAnnual && (
        <p className="text-xs font-medium text-green-600 mt-1">billed ${annual} per year — 2 months free</p>
      )}
      <p className="mt-2 text-sm text-gray-500 min-h-[40px]">{plan.description}</p>

      <div className="mt-4 mb-6">
        {isCurrent ? (
          <div>
            <span className="block w-full text-center py-2.5 rounded-lg border border-customPrimary text-customPrimary font-medium text-sm">
              Your current plan
            </span>
            {isPaid && subscription?.status === 'active' && !subscription?.cancel_at_period_end && (
              <button
                onClick={onCancel}
                className="mt-2 w-full text-center text-xs text-gray-400 hover:text-red-500 underline"
              >
                Cancel subscription (keeps access until period end)
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
            disabled={busy}
            className={`block w-full py-2.5 rounded-lg font-medium text-sm transition-colors text-white ${
              busy
                ? 'bg-gray-300 cursor-wait'
                : 'bg-customPrimary hover:bg-customPrimaryHover'
            }`}
          >
            {busy ? 'Opening checkout…' : `Upgrade to ${plan.name}`}
          </button>
        ) : isPaid ? (
          <button
            disabled
            title={PAID_CTA_NOTE}
            className="block w-full py-2.5 rounded-lg bg-gray-200 text-gray-500 font-medium text-sm cursor-not-allowed"
          >
            Coming soon
          </button>
        ) : (
          <Link
            to="/signup"
            className="block w-full text-center py-2.5 rounded-lg bg-customPrimary hover:bg-customPrimaryHover text-white font-medium text-sm transition-colors"
          >
            {isAuthenticated ? 'Included with your account' : 'Create free account'}
          </Link>
        )}
      </div>

      <ul className="space-y-2.5 text-sm">
        {limitRows(plan).map((row) => (
          <li key={row.label} className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-2 text-gray-600">
              <Check className="w-4 h-4 text-customPrimary shrink-0" />
              {row.label}
            </span>
            <span className="font-semibold text-gray-800 whitespace-nowrap tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Pricing = () => {
  const { isAuthenticated, authRequest } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState(null);
  const [catalog, setCatalog] = useState({});
  const [currentSlug, setCurrentSlug] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [cycle, setCycle] = useState('monthly');
  const [busyPlan, setBusyPlan] = useState(null);
  const [error, setError] = useState(false);

  const refreshMine = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const mine = await fetchMyPlan(authRequest);
      setCurrentSlug(mine?.plan?.slug ?? null);
      setSubscription(await fetchSubscription(authRequest));
    } catch (e) {
      console.error('Failed to load current plan:', e);
    }
  }, [isAuthenticated, authRequest]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(false);
      try {
        const catalogue = await fetchPlans();
        if (cancelled) return;
        setPlans(catalogue);
        // Purchase metadata is optional: without it, paid plans simply show
        // "Coming soon" instead of a checkout button.
        try {
          const purchases = await fetchBillingCatalog();
          if (!cancelled) setCatalog(Object.fromEntries(purchases.map((c) => [c.plan_slug, c])));
        } catch (e) {
          console.error('Billing catalog unavailable:', e);
        }
        if (isAuthenticated && !cancelled) await refreshMine();
      } catch (e) {
        console.error('Failed to load pricing:', e);
        if (!cancelled) setError(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshMine]);

  const handleUpgrade = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBusyPlan(plan.slug);
    try {
      const config = await createCheckout(authRequest, plan.slug, cycle);
      await openCheckout(config, {
        onSuccess: () => {
          toast.success('Payment successful! Activating your plan…');
          // The webhook activates the plan; poll briefly until it lands.
          let attempts = 0;
          const poll = setInterval(async () => {
            attempts += 1;
            await refreshMine();
            if (attempts >= 5) clearInterval(poll);
          }, 2000);
        },
      });
    } catch (e) {
      toast.error(e.response?.data?.error || e.response?.data?.detail || e.message || 'Could not start checkout');
    } finally {
      setBusyPlan(null);
    }
  };

  const handleCancel = async () => {
    try {
      const result = await cancelSubscription(authRequest);
      toast.success(result.msg || 'Subscription will end at the current period.');
      await refreshMine();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Cancellation failed. Try again.');
    }
  };

  const guest = plans?.find((p) => p.slug === 'guest');
  const purchasable = plans?.filter((p) => p.slug !== 'guest') ?? [];
  const hasPurchases = Object.keys(catalog).length > 0;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Start free. Upgrade when you need more.</h1>
        <p className="mt-3 text-gray-500 text-sm sm:text-base">
          Daily AI limits reset on a rolling 24-hour window.
        </p>

        {hasPurchases && (
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mt-6">
            {['monthly', 'annual'].map((option) => (
              <button
                key={option}
                onClick={() => setCycle(option)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  cycle === option ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                {option === 'monthly' ? 'Monthly' : 'Annual'}
                {option === 'annual' && (
                  <span className="ml-1 text-green-600 font-semibold">2 months free</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="text-center py-16">
          <p className="text-gray-600">Plans couldn&apos;t be loaded. Check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg bg-customPrimary hover:bg-customPrimaryHover text-white text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {!plans && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-gray-100 rounded-3xl border" />
          ))}
        </div>
      )}

      {plans && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {purchasable.map((plan) => (
              <PlanCard
                key={plan.slug}
                plan={plan}
                purchase={catalog[plan.slug]}
                cycle={cycle}
                highlighted={plan.slug === 'pro'}
                currentSlug={currentSlug}
                isAuthenticated={isAuthenticated}
                subscription={currentSlug === plan.slug ? subscription : null}
                busy={busyPlan === plan.slug}
                onUpgrade={handleUpgrade}
                onCancel={handleCancel}
              />
            ))}
          </div>

          {guest && (
            <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <NotebookPen className="w-5 h-5 text-customPrimary" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-800">Just browsing? No account needed.</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Take notes up to {guest.max_note_chars.toLocaleString()} characters ({guest.max_notes_per_video} per
                  video), capture {guest.max_screenshots_per_video} screenshots per video and download your PDF — all
                  in your browser, free forever. AI features unlock the moment you sign up.
                </p>
              </div>
              {!isAuthenticated && (
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-customPrimary hover:text-customPrimaryHover whitespace-nowrap"
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

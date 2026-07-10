import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, NotebookPen, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyPlan, fetchPlans, formatStorage } from '../../services/planService';

/**
 * Every number on this page is fetched from the backend plan catalogue —
 * the same rows the API enforces — so pricing can never drift from reality.
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

function PlanCard({ plan, highlighted, currentSlug, isAuthenticated }) {
  const isCurrent = currentSlug === plan.slug;
  const isPaid = plan.monthly_price_usd > 0;

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
          {isPaid ? `$${Number(plan.monthly_price_usd)}` : '$0'}
        </span>
        <span className="text-sm text-gray-500">/ month</span>
      </div>
      <p className="mt-2 text-sm text-gray-500 min-h-[40px]">{plan.description}</p>

      <div className="mt-4 mb-6">
        {isCurrent ? (
          <span className="block w-full text-center py-2.5 rounded-lg border border-customPrimary text-customPrimary font-medium text-sm">
            Your current plan
          </span>
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
  const [plans, setPlans] = useState(null);
  const [currentSlug, setCurrentSlug] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(false);
      try {
        const catalogue = await fetchPlans();
        if (cancelled) return;
        setPlans(catalogue);
        if (isAuthenticated) {
          const mine = await fetchMyPlan(authRequest);
          if (!cancelled) setCurrentSlug(mine?.plan?.slug ?? null);
        }
      } catch (e) {
        console.error('Failed to load pricing:', e);
        if (!cancelled) setError(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authRequest]);

  const guest = plans?.find((p) => p.slug === 'guest');
  const purchasable = plans?.filter((p) => p.slug !== 'guest') ?? [];

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Start free. Upgrade when you need more.</h1>
        <p className="mt-3 text-gray-500 text-sm sm:text-base">
          Daily AI limits reset on a rolling 24-hour window. Prices are introductory while we finish checkout.
        </p>
      </div>

      {error && (
        <div className="text-center py-16">
          <p className="text-gray-600">Plans couldn't be loaded. Check your connection and try again.</p>
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
                highlighted={plan.slug === 'pro'}
                currentSlug={currentSlug}
                isAuthenticated={isAuthenticated}
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

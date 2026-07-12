import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Check, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  cancelSubscription,
  createCheckout,
  getBillingCatalog,
  getMyPlan,
  getPlans,
  getSubscription,
} from "../../services/billingService";
import { openCheckout } from "../../services/paddle";
import Loader from "../../components/Loader/Loader";

const gb = (mb) => (mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`);

// Human-readable highlights derived from the plan's limit values.
const planFeatures = (plan) => [
  `${plan.daily_summaries} AI summaries / day`,
  `${plan.daily_chat_messages} AI chat messages / day`,
  `${gb(plan.storage_limit_mb)} PDF storage`,
  `Files up to ${plan.max_file_size_mb} MB`,
  `${plan.max_screenshots_per_video} screenshots / video`,
  `Transcript context up to ${Math.round(plan.transcript_token_budget / 1000)}K tokens`,
];

const Pricing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [catalog, setCatalog] = useState({});
  const [myPlan, setMyPlan] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [cycle, setCycle] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [busyPlan, setBusyPlan] = useState(null);

  const refreshMine = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [mine, sub] = await Promise.all([getMyPlan(), getSubscription()]);
      setMyPlan(mine);
      setSubscription(sub);
    } catch {
      /* not fatal for the pricing page */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    (async () => {
      try {
        const [planList, catalogList] = await Promise.all([getPlans(), getBillingCatalog()]);
        // Guests aren't a sellable tier; the pricing page shows account plans.
        setPlans(planList.filter((p) => p.slug !== "guest"));
        setCatalog(Object.fromEntries(catalogList.map((c) => [c.plan_slug, c])));
        await refreshMine();
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshMine]);

  const currentSlug = myPlan?.plan?.slug || (isAuthenticated ? "free" : null);

  const handleSelect = async (plan) => {
    if (!isAuthenticated) {
      navigate(plan.monthly_price_usd > 0 ? "/login" : "/signup");
      return;
    }
    if (plan.monthly_price_usd === 0 || plan.slug === currentSlug) return;

    setBusyPlan(plan.slug);
    try {
      const config = await createCheckout(plan.slug, cycle);
      await openCheckout(config, {
        onSuccess: () => {
          toast.success("Payment successful! Activating your plan…");
          // The webhook activates the plan; poll briefly until it lands.
          let attempts = 0;
          const poll = setInterval(async () => {
            attempts += 1;
            await refreshMine();
            if (attempts >= 5) clearInterval(poll);
          }, 2000);
        },
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyPlan(null);
    }
  };

  const handleCancel = async () => {
    try {
      const result = await cancelSubscription();
      toast.success(result.msg);
      await refreshMine();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="px-4 py-10 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Plans &amp; Pricing</h1>
        <p className="text-gray-500 mt-2">
          AI summaries, key points and chat for every video you study.
        </p>

        {/* Billing cycle toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mt-6">
          {["monthly", "annual"].map((option) => (
            <button
              key={option}
              onClick={() => setCycle(option)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                cycle === option ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              {option === "monthly" ? "Monthly" : "Annual"}
              {option === "annual" && (
                <span className="ml-1 text-green-600 font-semibold">2 months free</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const purchase = catalog[plan.slug];
          const isCurrent = plan.slug === currentSlug;
          const isPro = plan.slug === "pro";
          const monthly = Number(plan.monthly_price_usd);
          const annual = purchase ? Number(purchase.annual_price_usd) : monthly * 10;
          const shownPrice = cycle === "monthly" ? monthly : annual / 12;

          return (
            <div
              key={plan.slug}
              className={`relative bg-white rounded-2xl shadow p-6 flex flex-col border-2 ${
                isPro ? "border-blue-600" : "border-transparent"
              }`}
            >
              {isPro && (
                <span className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap size={12} /> Most popular
                </span>
              )}

              <h2 className="text-xl font-semibold text-gray-800">{plan.name}</h2>
              <p className="text-sm text-gray-500 mt-1 min-h-[40px]">{plan.description}</p>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">
                  ${monthly === 0 ? 0 : +shownPrice.toFixed(2)}
                </span>
                <span className="text-gray-500 text-sm">/ month</span>
              </div>
              {monthly > 0 && cycle === "annual" && (
                <p className="text-xs text-green-600 mt-1">billed ${annual} per year</p>
              )}

              <ul className="mt-5 pt-4 border-t border-gray-100 space-y-2 flex-grow">
                {planFeatures(plan).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect(plan)}
                disabled={isCurrent || busyPlan === plan.slug}
                className={`mt-6 w-full py-2.5 rounded-lg font-medium transition-colors ${
                  isCurrent
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : isPro
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : monthly === 0
                        ? "bg-gray-100 text-gray-500"
                        : "bg-gray-800 text-white hover:bg-gray-900"
                }`}
              >
                {isCurrent
                  ? "Current plan"
                  : busyPlan === plan.slug
                    ? "Opening checkout…"
                    : monthly === 0
                      ? isAuthenticated
                        ? "Included"
                        : "Sign up free"
                      : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Current usage + cancellation for signed-in users */}
      {myPlan?.usage && (
        <div className="mt-10 bg-white rounded-2xl shadow p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold text-gray-800 mb-3">
            Your usage (rolling 24 hours) — {myPlan.plan.name} plan
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <UsageBar label="Summaries" usage={myPlan.usage.summary} />
            <UsageBar label="Chat messages" usage={myPlan.usage.chat} />
          </div>
          {subscription?.status === "active" && !subscription?.cancel_at_period_end && (
            <button
              onClick={handleCancel}
              className="mt-5 text-sm text-red-500 hover:text-red-600 underline"
            >
              Cancel subscription (keeps access until period end)
            </button>
          )}
          {subscription?.cancel_at_period_end && (
            <p className="mt-5 text-sm text-amber-600">
              Your subscription ends on{" "}
              {new Date(subscription.current_period_end).toLocaleDateString()} and will not renew.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const UsageBar = ({ label, usage }) => {
  if (!usage) return null;
  const { used, limit, resets_at } = usage;
  const percent = Math.min(100, limit ? (used / limit) * 100 : 0);
  return (
    <div>
      <div className="flex justify-between text-gray-600 mb-1">
        <span>{label}</span>
        <span>
          {used} / {limit}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full">
        <div
          className={`h-2 rounded-full ${percent >= 100 ? "bg-red-500" : "bg-blue-600"}`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      {percent >= 100 && resets_at && (
        <p className="text-xs text-gray-400 mt-1">
          resets {new Date(resets_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
};

export default Pricing;

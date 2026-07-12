import { Link } from 'react-router-dom';
import { formatResetTime } from '../../services/planService';

const USAGE_ROWS = [
  { key: 'summary', label: 'Summaries + key points' },
  { key: 'chat', label: 'Chat messages' },
];

// Meter color carries state: brand while fine, amber when running low, red when spent.
const meterColor = (fraction) => {
  if (fraction >= 1) return 'bg-red-500';
  if (fraction >= 0.8) return 'bg-amber-500';
  return 'bg-customPrimary';
};

const Meter = ({ label, used, limit, resetsAt }) => {
  const fraction = limit > 0 ? Math.min(1, used / limit) : 1;
  // Only a spent meter needs the unblock time; formatResetTime renders the
  // backend's UTC timestamp in the viewer's timezone.
  const resetPhrase = fraction >= 1 && resetsAt ? formatResetTime(resetsAt) : null;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900 tabular-nums">
          {used}<span className="font-normal text-gray-400"> / {limit}</span>
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${meterColor(fraction)}`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      {resetPhrase && <p className="text-xs text-gray-400 mt-1.5">Resets {resetPhrase}</p>}
    </div>
  );
};

/** Daily AI usage meters, driven by GET /api/plans/me/. */
const UsagePanel = ({ planName, usage }) => {
  if (!usage) return null;

  return (
    <section className="h-full bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Today's AI usage</h2>
          <p className="text-xs text-gray-400 mt-0.5">Limits reset on a rolling 24-hour window</p>
        </div>
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-indigo-50 text-customPrimary text-xs font-semibold">
          {planName}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6">
        {USAGE_ROWS.map(({ key, label }) => {
          const row = usage[key];
          if (!row) return null;
          return <Meter key={key} label={label} used={row.used} limit={row.limit} resetsAt={row.resets_at} />;
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link to="/pricing" className="text-xs font-medium text-customPrimary hover:text-customPrimaryHover">
          Need higher limits? Compare plans →
        </Link>
      </div>
    </section>
  );
};

export default UsagePanel;

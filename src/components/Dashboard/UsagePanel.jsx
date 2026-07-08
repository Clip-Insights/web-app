import { Link } from 'react-router-dom';

const USAGE_ROWS = [
  { key: 'summary', label: 'Summaries + key points' },
  { key: 'chat', label: 'Chat messages' },
  { key: 'transcription', label: 'Transcriptions' },
];

/** Daily AI usage meters, driven by GET /api/plans/me/. */
const UsagePanel = ({ planName, usage }) => {
  if (!usage) return null;

  const nearLimit = USAGE_ROWS.some(({ key }) => {
    const row = usage[key];
    return row && row.limit > 0 && row.remaining / row.limit <= 0.2;
  });

  return (
    <div className="bg-[#FCFCFF] border p-6 rounded-3xl mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm font-medium text-gray-700 font-inter">Today's AI usage</span>
          <p className="text-xs text-gray-400 mt-0.5">Limits reset on a rolling 24-hour window</p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-customPrimary">{planName} plan</span>
      </div>

      <div className="space-y-4">
        {USAGE_ROWS.map(({ key, label }) => {
          const row = usage[key];
          if (!row) return null;
          const pct = row.limit > 0 ? Math.min(100, (row.used / row.limit) * 100) : 100;
          return (
            <div key={key}>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-gray-600 font-inter">{label}</span>
                <span className="font-semibold text-gray-800 tabular-nums">
                  {row.used} / {row.limit}
                </span>
              </div>
              <div className="relative w-full h-2.5 bg-gray-200 rounded">
                <div
                  className="absolute top-0 left-0 h-full rounded"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(to right, #3E4FFD 0%, #8000BB 100%)',
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {nearLimit && (
        <p className="mt-4 text-xs text-gray-500">
          Running low?{' '}
          <Link to="/pricing" className="text-customPrimary font-medium hover:text-customPrimaryHover">
            See plans with higher limits
          </Link>
        </p>
      )}
    </div>
  );
};

export default UsagePanel;

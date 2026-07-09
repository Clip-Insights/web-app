/**
 * Storage overview: one donut + the two numbers that matter (used, total).
 * Replaces the old trio of Total/Remaining/Used bar cards, which repeated the
 * same fact three ways (and always showed "Total" as a 100% filled bar).
 */
const RADIUS = 64;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const StorageCard = ({ usedMb, totalMb }) => {
  const total = Number(totalMb) || 0;
  const used = Number(usedMb) || 0;
  const fraction = total > 0 ? Math.min(1, used / total) : 0;
  const percentage = (fraction * 100).toFixed(1);
  const remaining = Math.max(0, total - used).toFixed(1);

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
      <h2 className="text-sm font-semibold text-gray-700">Storage</h2>
      <p className="text-xs text-gray-400 mt-0.5">Cloud space for your exported PDFs</p>

      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="relative">
          <svg width="176" height="176" viewBox="0 0 176 176" role="img" aria-label={`${percentage}% of storage used`}>
            <circle cx="88" cy="88" r={RADIUS} fill="none" stroke="#F3F4F6" strokeWidth={STROKE} />
            <circle
              cx="88"
              cy="88"
              r={RADIUS}
              fill="none"
              stroke="#3E4FFD"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
              transform="rotate(-90 88 88)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 tabular-nums">{percentage}%</span>
            <span className="text-xs text-gray-400 mt-1">used</span>
          </div>
        </div>

        <p className="mt-5 text-sm text-gray-600 tabular-nums">
          <span className="font-semibold text-gray-900">{used} MB</span> of {total} MB
        </p>
        <p className="mt-1 text-xs text-gray-400 tabular-nums">{remaining} MB free</p>
      </div>
    </section>
  );
};

export default StorageCard;

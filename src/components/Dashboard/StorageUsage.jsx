const StorageUsage = ({ label, value, total, used }) => {
  // Calculate percentage filled for progress bar
  const percentage = (used / total) * 100;

  return (
    <div className="bg-[#FCFCFF] border p-6 rounded-3xl mb-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 flex items-center justify-center">
            <img src="/icons/space.svg" alt="" />
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 font-inter">{label}</span>
          </div>
          <div className="text-2xl font-bold text-customPrimary mb-2 font-inter">{value}</div>
          <div className="relative w-full h-4 bg-gray-200 rounded">
            {/* Progress bar with a linear gradient */}
            <div
              className="absolute top-0 left-0 h-full rounded"
              style={{
                width: `${percentage}%`,
                background:
                  "linear-gradient(to right, #3E4FFD 0%, #8000BB 100%)",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageUsage;
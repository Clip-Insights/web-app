import React from "react";

const CircularProgress = ({ percentage }) => {
  // Make the radius relative to the container size for better responsiveness
  const radius = 70; // Reduced base radius for better scaling
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <h1 className="text-xl md:text-2xl font-semibold mb-4">Storage Usage</h1>
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
        {/* Using viewBox without explicit width/height for responsiveness */}
        <svg className="w-full h-auto" viewBox="0 0 200 200">
          {/* Define the linear gradient */}
          <defs>
            <linearGradient
              id="circleGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="50%" stopColor="#8000BB" />
              <stop offset="100%" stopColor="#3E4FFD" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="12"
          />
          {/* Progress circle with gradient */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="url(#circleGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
          />
          {/* Percentage text */}
          <text
            x="100"
            y="100"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="28"
            fontWeight="bold"
          >
            {percentage}%
          </text>
          {/* Subtitle text moved inside SVG for better scaling */}
          <text
            x="100"
            y="125"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#9CA3AF"
          >
            Total Space Used
          </text>
        </svg>
      </div>
    </div>
  );
};

export default CircularProgress;
import React from 'react';

const PageNotFound = () => {
  return (
    <div className="flex flex-col w-full items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md text-center">
        {/* Error code */}
        <h1 className="text-9xl font-bold mb-2 text-customPrimary">
          404
        </h1>
        
        {/* Error message */}
        <h2 className="text-3xl font-semibold text-gray-800 mb-3">
          Page Not Found
        </h2>
        
        {/* Description */}
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        {/* Error illustration */}
        <div className="mb-8 flex justify-center">
          <svg width="200" height="140" viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 20C120 20 140 40 160 40C180 40 190 20 190 20V110C190 110 180 130 160 130C140 130 120 110 100 110C80 110 60 130 40 130C20 130 10 110 10 110V20C10 20 20 40 40 40C60 40 80 20 100 20Z" fill="#F3F4F6" className="stroke-customPrimary" strokeWidth="2"/>
            {/* <path d="M10 50H190" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="4 4"/> */}
            <circle cx="50" cy="50" r="10" className="fill-customPrimary"/>
            <circle cx="150" cy="50" r="10" className="fill-customPrimary"/>
            <path d="M70 80C70 80 80 90 100 90C120 90 130 80 130 80" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        
        {/* Dashboard button */}
        <button
          className="px-6 py-3 text-white font-medium rounded-lg shadow-sm transition-all hover:shadow-md bg-customPrimary border-customPrimary"
          onClick={() => window.location.href = '/'}
        >
          Go to Dashboard
        </button>
      </div>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>© 2025 Clip Insights</p>
      </footer>
    </div>
  );
};

export default PageNotFound;
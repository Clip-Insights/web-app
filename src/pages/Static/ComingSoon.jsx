import { useState } from 'react';

const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setEmail('');
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-20 px-4">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 px-2 sm:px-4">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800">
            Coming Soon
            <span className="ml-2 text-yellow-400">👋</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base md:text-lg">
            We're working on something amazing
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow mb-4 sm:mb-6 mx-0">
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-sm sm:text-base md:text-lg font-semibold text-blue-600">
                Progress
              </span>
              <span className="text-sm sm:text-base md:text-lg font-semibold text-blue-600">
                75%
              </span>
            </div>
            <div className="w-full h-2 sm:h-3 bg-gray-200 rounded-full">
              <div
                className="h-2 sm:h-3 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: '75%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Email Signup */}
        <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 shadow">
          <div className="mb-3 text-center">
            <span className="text-sm sm:text-base md:text-lg font-medium">
              Get notified when we launch
            </span>
          </div>

          {isSubmitted ? (
            <div className="py-2 sm:py-3 px-3 sm:px-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-center text-xs sm:text-sm md:text-base">
              Thanks! We'll notify you when we launch.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg sm:rounded-l-lg sm:rounded-r-none flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm md:text-base"
                required
              />
              <button
                type="submit"
                className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-r-lg sm:rounded-l-none text-white transition-colors text-xs sm:text-sm md:text-base font-medium ${
                  isLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-customPrimary hover:bg-blue-700 active:bg-blue-800'
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Notify Me'}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="mt-6 text-center text-gray-500 text-xs sm:text-sm">
        <p>© 2025 Clip Insights</p>
      </footer>
    </div>
  );
};

export default ComingSoon;
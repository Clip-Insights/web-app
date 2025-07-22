import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ title, subtitle, icon, packagePlan, onToggleSidebar }) => {
  const handleHamburger = () => {
    onToggleSidebar();
  };

  return (
    <header className="sticky top-0 bg-white z-40 shadow-sm">
      {/* Reduced z-index from 50 to 40 */}
      <div className="pt-3 pb-3 border-b border-gray-200 px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Hamburger + Title */}
          <div className="flex items-start md:items-center space-x-4">
            {/* Hamburger Button (mobile only) */}
            <button onClick={handleHamburger} className="md:hidden">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Title + Subtitle */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-gray-500 flex items-center text-sm sm:text-base">
                  {subtitle} {icon && <span className="ml-2">{icon}</span>}
                </p>
              )}
            </div>
          </div>

          {/* Right: Package Plan + Profile */}
          <div className="flex items-center space-x-6">
            {packagePlan && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded">
                  <img src="/icons/plan.svg" alt="Plan" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Current Package</span>
                  <span className="text-sm font-medium text-gray-800">{packagePlan.name}</span>
                </div>
              </div>
            )}
            <div className="w-12 h-12 bg-yellow-500 rounded-full overflow-hidden">
              <img
                src="/icons/profile.png"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
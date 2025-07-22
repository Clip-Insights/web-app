import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import routeMeta from '../utils/routeMeta';

function MainLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const hideSidebarRoutes = ['/login', '/signup', '/reset-password'];
  const hideheader = ['/pricing', '/products'];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  // Sort keys so more specific routes match first.
  const sortedKeys = Object.keys(routeMeta).sort((a, b) => b.length - a.length);
  const matchedKey = sortedKeys.find(key =>
    location.pathname.startsWith(key)
  );
  const meta = routeMeta[matchedKey] || { title: 'Page', subtitle: '' };

  // Handler that forces sidebar open state if a boolean is provided.
  const handleSidebarToggle = (force) => {
    if (typeof force === 'boolean') {
      setIsSidebarOpen(force);
    } else {
      setIsSidebarOpen(prev => !prev);
    }
  };

  return (
    <div className="flex min-h-screen">
      {!shouldHideSidebar && (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}
        {!hideheader && (
          <Header
            title={meta.title}
            subtitle={meta.subtitle}
            onToggleSidebar={handleSidebarToggle}
            isSidebarOpen={isSidebarOpen}
            packagePlan={{ name: 'Pro' }}
          />
      )}

      <div className="flex-1 flex flex-col">
        {!shouldHideSidebar && (
          <Header
            title={meta.title}
            subtitle={meta.subtitle}
            onToggleSidebar={handleSidebarToggle}
            isSidebarOpen={isSidebarOpen}
            packagePlan={{ name: 'Pro' }}
          />
        )}
        <main className="flex-1 p-4 pt-0 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;

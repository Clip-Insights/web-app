import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import routeMeta from '../utils/routeMeta';
import { useAuth } from '../context/AuthContext';
import { fetchMyPlan } from '../services/planService';

function MainLayout() {
  const location = useLocation();
  const { isAuthenticated, authRequest } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [packagePlan, setPackagePlan] = useState(null);

  const hideSidebarRoutes = ['/login', '/signup', '/reset-password'];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  // The header badge shows the user's real plan (from the backend), not a placeholder.
  useEffect(() => {
    if (!isAuthenticated) {
      setPackagePlan(null);
      return;
    }
    let cancelled = false;
    fetchMyPlan(authRequest)
      .then((data) => {
        if (!cancelled && data?.plan) setPackagePlan({ name: data.plan.name });
      })
      .catch((error) => console.error('Error fetching plan for header:', error));
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authRequest]);

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

      <div className="flex-1 flex flex-col">
        {!shouldHideSidebar && (
          <Header
            title={meta.title}
            subtitle={meta.subtitle}
            onToggleSidebar={handleSidebarToggle}
            isSidebarOpen={isSidebarOpen}
            packagePlan={packagePlan}
          />
        )}
        <main className={['/login', '/signup'].includes(location.pathname) ? 'flex-1' : 'flex-1 p-4 pt-0 sm:p-6 md:p-8'}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;

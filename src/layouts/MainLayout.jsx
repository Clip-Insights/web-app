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
  const [planLoading, setPlanLoading] = useState(isAuthenticated);

  const hideSidebarRoutes = ['/login', '/signup', '/reset-password'];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname) || location.pathname.startsWith('/reset-password/');

  // The header badge shows the user's real plan (from the backend), not a placeholder.
  useEffect(() => {
    if (!isAuthenticated) {
      setPackagePlan(null);
      setPlanLoading(false);
      return;
    }
    let cancelled = false;
    setPlanLoading(true);
    fetchMyPlan(authRequest)
      .then((data) => {
        if (!cancelled && data?.plan) setPackagePlan({ name: data.plan.name });
      })
      .catch((error) => console.error('Error fetching plan for header:', error))
      .finally(() => { if (!cancelled) setPlanLoading(false); });
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
    <div className="flex min-h-screen bg-auth-panel font-primary text-auth-ink">
      {!shouldHideSidebar && (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}

      <div className="min-w-0 flex-1 flex flex-col">
        {!shouldHideSidebar && (
          <Header
            title={meta.title}
            subtitle={meta.subtitle}
            onToggleSidebar={handleSidebarToggle}
            isSidebarOpen={isSidebarOpen}
            packagePlan={packagePlan}
            planLoading={planLoading}
          />
        )}
        <main className={shouldHideSidebar ? 'flex-1' : 'flex-1 p-4 sm:p-6 lg:px-8'}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;

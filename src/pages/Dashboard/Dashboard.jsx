import { UsageSkeleton, StorageSkeleton, Skeleton } from '../../components/Loading/Skeletons';
import { useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../services/apiService";
import StorageCard from "../../components/Dashboard/StorageCard";
import UsagePanel from "../../components/Dashboard/UsagePanel";
import RecentFiles from "../Files/RecentFiles";
import { fetchMyPlan } from "../../services/planService";

import useAsyncResource from '../../hooks/useAsyncResource';
import ResourceError from '../../components/Feedback/ResourceError';

const greetingForNow = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const { authRequest } = useAuth();
  const profile = useAsyncResource(useCallback(async () => {
    const response = await authRequest({ method: 'get', url: getApiUrl('account/profile/') });
    return response.data;
  }, [authRequest]));
  const plan = useAsyncResource(useCallback(() => fetchMyPlan(authRequest), [authRequest]));
  const storage = useAsyncResource(useCallback(async () => {
    const response = await authRequest({ method: 'get', url: getApiUrl('userspace/storage-info') });
    if (response.data?.message !== 'success') throw new Error('Storage unavailable');
    return { totalMb: response.data.allowed_space / (1024 * 1024), usedMb: response.data.used_space / (1024 * 1024) };
  }, [authRequest]));
  const name = profile.data?.name || '';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-auth-ink">
          {greetingForNow()}
          {profile.status === 'loading' ? <span className="ml-2 inline-block align-middle" role="status" aria-label="Loading your name"><Skeleton className="h-7 w-24" /></span> : name ? `, ${name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-auth-muted mt-1">{today}</p>
        {profile.status === 'error' && <button type="button" onClick={profile.retry} className="mt-2 min-h-11 rounded text-sm text-auth-muted underline underline-offset-4">Your profile couldn’t load. Try again</button>}
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            {plan.status === 'loading' ? <UsageSkeleton /> : plan.data?.usage ? <UsagePanel planName={plan.data.plan.name} usage={plan.data.usage} /> : <ResourceError title="Usage information couldn’t load" onRetry={plan.retry} />}
          </div>
          {storage.status === 'loading' ? <StorageSkeleton /> : storage.data ? <StorageCard usedMb={storage.data.usedMb} totalMb={storage.data.totalMb} /> : <ResourceError title="Storage information couldn’t load" onRetry={storage.retry} />}
        </div>

      <RecentFiles />
    </div>
  );
};

export default Dashboard;

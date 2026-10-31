import { UsageSkeleton, StorageSkeleton, Skeleton } from '../../components/Loading/Skeletons';
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../services/apiService";
import StorageCard from "../../components/Dashboard/StorageCard";
import UsagePanel from "../../components/Dashboard/UsagePanel";
import RecentFiles from "../Files/RecentFiles";
import { fetchMyPlan } from "../../services/planService";

const greetingForNow = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const { authRequest } = useAuth();
  const [name, setName] = useState("");
  const [storageData, setStorageData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [storageLoading, setStorageLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authRequest({ method: "get", url: getApiUrl("account/profile/") })
      .then((response) => {
        if (!cancelled && response.data?.name) setName(response.data.name);
      })
      .catch((error) => console.error("Error fetching profile:", error))
      .finally(() => { if (!cancelled) setProfileLoading(false); });

    fetchMyPlan(authRequest)
      .then((data) => {
        if (!cancelled && data?.plan) setPlanData(data);
      })
      .catch((error) => console.error("Error fetching plan usage:", error))
      .finally(() => { if (!cancelled) setPlanLoading(false); });

    authRequest({ method: "get", url: getApiUrl("userspace/storage-info") })
      .then((response) => {
        if (cancelled || response.data?.message !== "success") return;
        setStorageData({
          totalMb: (response.data.allowed_space / (1024 * 1024)).toFixed(1),
          usedMb: (response.data.used_space / (1024 * 1024)).toFixed(1),
        });
      })
      .catch((error) => console.error("Error fetching storage data:", error))
      .finally(() => { if (!cancelled) setStorageLoading(false); });

    return () => {
      cancelled = true;
    };
  }, [authRequest]);

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
          {profileLoading ? <span className="ml-2 inline-block align-middle" role="status" aria-label="Loading your name"><Skeleton className="h-7 w-24" /></span> : name ? `, ${name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-auth-muted mt-1">{today}</p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            {planLoading ? <UsageSkeleton /> : planData ? (
              <UsagePanel planName={planData.plan.name} usage={planData.usage} />
            ) : (
              <section className="h-full bg-white border border-gray-200 rounded-2xl p-6 flex items-center text-sm text-gray-500">
                Usage information is unavailable right now. Refresh to try again.
              </section>
            )}
          </div>
          {storageLoading ? <StorageSkeleton /> : storageData ? (
            <StorageCard usedMb={storageData.usedMb} totalMb={storageData.totalMb} />
          ) : (
            <section className="h-full bg-white border border-gray-200 rounded-2xl p-6 flex items-center text-sm text-gray-500">
              Storage information is unavailable right now. Refresh to try again.
            </section>
          )}
        </div>

      <RecentFiles />
    </div>
  );
};

export default Dashboard;

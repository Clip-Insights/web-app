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

const SkeletonCard = ({ className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-2xl p-6 animate-pulse ${className}`}>
    <div className="h-4 bg-gray-100 rounded w-40 mb-6"></div>
    {[1, 2, 3].map((row) => (
      <div key={row} className="mb-5">
        <div className="flex justify-between mb-2">
          <div className="h-3 bg-gray-100 rounded w-32"></div>
          <div className="h-3 bg-gray-100 rounded w-10"></div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full w-full"></div>
      </div>
    ))}
  </div>
);

const Dashboard = () => {
  const { authRequest } = useAuth();
  const [name, setName] = useState("");
  const [storageData, setStorageData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = authRequest({ method: "get", url: getApiUrl("account/profile/") })
      .then((response) => {
        if (!cancelled && response.data?.name) setName(response.data.name);
      })
      .catch((error) => console.error("Error fetching profile:", error));

    const loadPlan = fetchMyPlan(authRequest)
      .then((data) => {
        if (!cancelled && data?.plan) setPlanData(data);
      })
      .catch((error) => console.error("Error fetching plan usage:", error));

    const loadStorage = authRequest({ method: "get", url: getApiUrl("userspace/storage-info") })
      .then((response) => {
        if (cancelled || response.data?.message !== "success") return;
        setStorageData({
          totalMb: (response.data.allowed_space / (1024 * 1024)).toFixed(1),
          usedMb: (response.data.used_space / (1024 * 1024)).toFixed(1),
        });
      })
      .catch((error) => console.error("Error fetching storage data:", error));

    Promise.allSettled([loadProfile, loadPlan, loadStorage]).then(() => {
      if (!cancelled) setLoading(false);
    });

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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {greetingForNow()}
          {name ? `, ${name.split(" ")[0]}` : ""} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{today}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonCard className="lg:col-span-2" />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            {planData ? (
              <UsagePanel planName={planData.plan.name} usage={planData.usage} />
            ) : (
              <section className="bg-white border border-gray-200 rounded-2xl p-6 text-sm text-gray-500">
                Usage information is unavailable right now. Refresh to try again.
              </section>
            )}
          </div>
          {storageData ? (
            <StorageCard usedMb={storageData.usedMb} totalMb={storageData.totalMb} />
          ) : (
            <section className="bg-white border border-gray-200 rounded-2xl p-6 text-sm text-gray-500">
              Storage information is unavailable right now. Refresh to try again.
            </section>
          )}
        </div>
      )}

      <RecentFiles />
    </div>
  );
};

export default Dashboard;

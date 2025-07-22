import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header/Header";
import { getApiUrl } from "../../services/apiService";
import CircularProgress from "../../components/Dashboard/CircularProgress";
import StorageUsage from "../../components/Dashboard/StorageUsage";
import RecentFiles from "../Files/RecentFiles";
import Sidebar from "../../components/Sidebar/Sidebar";

const Dashboard = () => {
  const name = "Fellow";
  const { authRequest } = useAuth();
  const [storageData, setStorageData] = useState({
    total: 0,
    remaining: 0,
    used: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserSpaceInfo() {
      try {
        const response = await authRequest({
          method: "get",
          url: getApiUrl("userspace/storage-info"),
        });

        if (response.data?.message === "success") {
          setStorageData({
            total: (response.data.allowed_space / (1024 * 1024)).toFixed(1), // MB
            remaining: (response.data.remaining_space / (1024 * 1024)).toFixed(1), // MB
            used: (response.data.used_space / (1024 * 1024)).toFixed(1), // MB
          });
        } else {
          console.error("Unexpected response format:", response);
        }
      } catch (error) {
        console.error("Error fetching storage data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserSpaceInfo();
  }, [authRequest]);

  // Calculate percentage used
  const percentageUsed = (storageData.used / storageData.total) * 100;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column loading state */}
          <div className="lg:col-span-2">
            <div className="animate-pulse">
              {/* User greeting skeleton */}
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              
              {/* StorageUsage skeletons */}
              {[1, 2, 3].map((item) => (
                <div key={item} className="mb-4">
                  <div className="flex justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full w-full"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right column loading state */}
          <div className="bg-[#FCFCFF] rounded-3xl border flex items-center justify-center max-h-[500px]">
            <div className="animate-pulse flex flex-col items-center p-8">
              <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
        
        {/* Recent Files loading state */}
        <div className="mt-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-40 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* <Header 
        title="Dashboard"
        subtitle="Where you can see your files, Securely!"
        icon="😊"
        packagePlan={{
          name: "Starter",
          details: "50 MB Storage | Basic Features",
        }}
      /> */}
 
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-xl font-inter font-semibold mb-4">Hello, {name} 👋</h1>
          <StorageUsage
            label="Total Space"
            value={`${storageData.total} MB`}
            total={storageData.total}
            used={storageData.total}
          />

          <StorageUsage
            label="Remaining Space"
            value={`${storageData.remaining} MB`}
            total={storageData.total}
            used={storageData.remaining}
          />

          <StorageUsage
            label="Used Space"
            value={`${storageData.used} MB`}
            total={storageData.total}
            used={storageData.used}
          />
        </div>

        <div className="bg-[#FCFCFF] rounded-3xl border flex items-center justify-center max-h-[500px]">
          <CircularProgress percentage={percentageUsed.toFixed(1)} />
        </div>
      </div>
      <RecentFiles/>
    </div>
  );
};

export default Dashboard;
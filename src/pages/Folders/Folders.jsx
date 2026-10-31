import LibraryLoadError from "../../components/Cards/LibraryLoadError";
import { useState, useEffect } from "react";
import { FolderPlus } from "lucide-react";
import FolderCard from "../../components/Cards/FolderCard";
import Alert from "../../components/Cards/Alert";
import LibraryDialog from "../../components/Cards/LibraryDialog";
import LibraryToolbar from "../../components/Cards/LibraryToolbar";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../services/apiService";
import { useNavigate } from "react-router-dom";
// Removed Loader import since we'll use the inline loader approach

const Folders = () => {
  const { authRequest } = useAuth();
  const [folders, setFolders] = useState([]);
  const [alert, setAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("Latest");
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoading(true);
        const response = await authRequest({
          method: "get",
          url: getApiUrl("userspace/folders/"),
        });
        console.log(response);
        
        setFolders(response.data);
      } catch (error) {
        showAlert("Failed to fetch folders", "error");
        setLoadError(true);
        console.error("Error fetching folders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, [authRequest]);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    // Auto-dismiss alert after 5 seconds
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  const handleRename = async (oldName, newName) => {
    try {
      const folderToRename = folders.find((folder) => folder.name === oldName);
      if (!folderToRename) {
        showAlert("Folder not found", "error");
        return;
      }

      const response = await authRequest({
        method: "patch",
        url: getApiUrl("userspace/folders/"),
        data: {
          folder_id: folderToRename.id,
          new_name: newName,
        },
      });
      console.log(response);
      if (response.data) {
        setFolders((prevFolders) =>
          prevFolders.map((folder) =>
            folder.id === folderToRename.id ? { ...folder, name: newName } : folder
          )
        );
        showAlert(`Folder renamed to ${newName}`, "success");
      } else {
        showAlert("Failed to rename folder", "error");
      }
    } catch (error) {
      showAlert("Failed to rename folder", "error");
      console.error("Error renaming folder:", error);
    }
  };

  const handleDelete = async (folderName) => {
    try {
      const folderToDelete = folders.find((folder) => folder.name === folderName);
      if (!folderToDelete) {
        showAlert("Folder not found", "error");
        return;
      }

      const response = await authRequest({
        method: "delete",
        url: getApiUrl("userspace/folders/"),
        data: {
          folder_id: folderToDelete.id,
        },
      });
      console.log(response);
      
      if (response.data) {
        setFolders((prevFolders) =>
          prevFolders.filter((folder) => folder.id !== folderToDelete.id)
        );
        showAlert("Folder deleted successfully", "success");
      } else {
        showAlert("Failed to delete folder", "error");
      }
    } catch (error) {
      showAlert("Failed to delete folder", "error");
      console.error("Error deleting folder:", error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showAlert("Folder name cannot be empty", "error");
      return;
    }

    try {
      const response = await authRequest({
        method: "post",
        url: getApiUrl("userspace/folders/"),
        data: {
          name: newFolderName,
        },
      });
      console.log(response);
      
      if (response.data) {
        setFolders((prev) => [...prev, response.data]);
        setNewFolderName("");
        setShowCreateFolderModal(false);
        showAlert(`Folder "${newFolderName}" created successfully`, "success");
      } else {
        showAlert("Failed to create folder", "error");
      }
    } catch (error) {
      showAlert("Failed to create folder", "error");
      console.error("Error creating folder:", error);
    }
  };

  const filteredFolders = folders.filter((folder) => {
    return folder.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedFolders = [...filteredFolders].sort((a, b) => {
    switch (sortType) {
      case "Name (A-Z)":
        return a.name.localeCompare(b.name);
      case "Name (Z-A)":
        return b.name.localeCompare(a.name);
      case "Oldest":
        return new Date(a.created_date) - new Date(b.created_date);
      case "Latest":
        return new Date(b.created_date) - new Date(a.created_date);
      case "Size (Small-Large)":
        return a.size - b.size;
      case "Size (Large-Small)":
        return b.size - a.size;
      default:
        return 0;
    }
  });

  const sortOptions = [
    "Latest",
    "Oldest",
    "Name (A-Z)",
    "Name (Z-A)",
    "Size (Small-Large)",
    "Size (Large-Small)",
  ];

  const navigateToFiles = (folderId) => {
    console.log("Navigating to files with folder ID:", folderId);
    navigate(`/files/${folderId}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <LibraryToolbar title="Folders" description="A little structure for everything you’re learning." count={sortedFolders.length} query={searchQuery} onQueryChange={setSearchQuery} sort={sortType} onSortChange={setSortType} sortOptions={sortOptions} action={<button onClick={() => setShowCreateFolderModal(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-auth-accent px-4 text-sm font-semibold text-white hover:bg-auth-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-accent"><FolderPlus size={17} aria-hidden="true" />New folder</button>} />

      {/* Folders Grid with loading state handling similar to RecentFiles */}
      {loadError ? <LibraryLoadError /> : loading ? (
        <div className="col-span-full flex items-center justify-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {sortedFolders.map((folder) => (
              <div key={folder.id} className="w-full">
                <FolderCard
                  folderName={folder.name}
                  itemCount={folder.items}
                  size={folder.size}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onClick={() => navigateToFiles(folder.id)}
                />
              </div>
            ))}
          </div>

          {/* Empty state - more visual on mobile */}
          {sortedFolders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-gray-500">
              <div className="mb-4">
                <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-center">{searchQuery ? 'No matching folders. Try another name.' : 'Create a folder for your next course, project, or idea.'}</p>
            </div>
          )}
        </>
      )}

      {/* Create Folder Modal - responsive padding and width */}
      {showCreateFolderModal && (
        <LibraryDialog title="New folder" onClose={() => setShowCreateFolderModal(false)}>
            <div className="mb-4">
              <label htmlFor="folderName" className="mb-2 block text-sm font-medium">Folder name</label>
              <input
                type="text"
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                placeholder="Enter Folder Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-customPrimary"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 text-base font-medium text-customPrimary border-customPrimary border rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-customPrimary order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateFolder}
                className="px-4 py-2 text-base font-medium text-white bg-customPrimary rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-customPrimary order-1 sm:order-2"
                disabled={!newFolderName.trim()}
              >
                Create
              </button>
            </div>
        </LibraryDialog>
      )}

      {/* Fixed position alert for consistent visibility */}
      {alert && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        </div>
      )}
    </div>
  );
};

export default Folders;
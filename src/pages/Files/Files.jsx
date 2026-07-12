import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Upload, Plus, LogIn } from "lucide-react";
import FileCard from "../../components/Cards/FileCard";
import Alert from "../../components/Cards/Alert";
import { getApiUrl } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header/Header";
import { useParams } from 'react-router-dom';

const Files = () => {
  let { folder_id } = useParams();
  if (!folder_id) {
    folder_id = -1;
  }
  console.log(folder_id);
  
  const { authRequest } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [alert, setAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("Latest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [title, setTitle] = useState("All Files");
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    // Fetch folder name and files from the API
    setLoading(true);
    fetchFolderAndFiles(folder_id).then((data) => {
      if (data) {
        setFiles(data.files || []);
        setTitle(data?.folder_name || "All Files");
      }
      setLoading(false);
    });
    
    // Fetch all folders for the move operation
    fetchFolders();
  }, [folder_id]);

  const fetchFolders = async () => {
    try {
      const response = await authRequest({
        method: "get",
        url: getApiUrl("userspace/folders/"),
      });
      
      console.log("Folders fetched:", response.data);
      setFolders(response.data);
    } catch (error) {
      console.error("Error fetching folders:", error);
      showAlert("Failed to fetch folders", "error");
    }
  };

  const fetchFolderAndFiles = async (folder_id) => {
    console.log("calling fetch files function with folder id: ", folder_id);
    
    try {
      const api_url =
        folder_id === -1
          ? "userspace/files/"
          : `userspace/folder-files/?folder_id=${folder_id}`;
      const response = await authRequest({
        method: "get",
        url: getApiUrl(api_url),
      });

      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching folder and files:", error);
      showAlert("Failed to fetch folder and files", "error");
      return null;
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    
    // Auto-dismiss alert after 5 seconds
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  const handleRename = async (oldName, newName) => {
    const fileIndex = files.findIndex((file) => file.name === oldName);
    const file = files[fileIndex];
    console.log(file);

    try {
      const response = await authRequest({
        method: "patch",
        url: getApiUrl("userspace/files/"),
        data: {
          file_id: file.id,
          new_name: newName
        }
      });
      console.log(response.data);
      // Update the file name in the UI
      setFiles((prevFiles) => {
        const newFiles = [...prevFiles];
        newFiles[fileIndex] = { ...file, name: newName };
        return newFiles;
      });
      showAlert("File renamed successfully", "success");
    } catch (error) {
      console.error("Error renaming file:", error);
      showAlert("Failed to rename file", "error");
    }
  };

  const handleDelete = (fileName) => {
    const fileIndex = files.findIndex((file) => file.name === fileName);
    const file = files[fileIndex];

      // Simulate API request
      authRequest({
        method: "delete",
        url: getApiUrl("userspace/files/"),
        data: { file_id: file.id }
      })
      .then((response) => {
        console.log(response.data);
        // Update the UI
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file.name !== fileName)
        );
        showAlert("File deleted successfully", "success");
      })
      .catch((error) => {
        console.error("Error deleting file:", error);
        showAlert("Failed to delete file", "error");
      });
  };

  // Add the handleMove function
  const handleMove = async (fileId, newFolderId) => {
    try {
      const response = await authRequest({
        method: "patch",
        url: getApiUrl("userspace/files/"),
        data: {
          file_id: fileId,
          folder_id: newFolderId
        }
      });
      
      console.log("Move response:", response.data);
      
      // If we're currently viewing all files, just update the folder_id
      if (folder_id === -1) {
        setFiles(prevFiles => 
          prevFiles.map(file => 
            file.id === fileId ? { ...file, folder_id: newFolderId } : file
          )
        );
      } else {
        // If we're viewing a specific folder, remove the file from the current view
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      }
      
      // Show success message
      showAlert(response.data.message || "File moved successfully", "success");
    } catch (error) {
      console.error("Error moving file:", error);
      showAlert(error.response?.data?.error || "Failed to move file", "error");
    }
  };

  const handleMoveSuccess = (message) => {
    showAlert(message, "success");
  };

  const handleUpload = () => {
    // Remind users that only PDF files are allowed
    showAlert("Please select PDF files only", "info");
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0]; // Get the first file only

    if (uploadedFile) {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", uploadedFile); // Append a single file

      if (folder_id && folder_id !== -1) {
        formData.append("folder_id", folder_id);
      }
      try {
        const response = await authRequest({
          method: "post",
          url: getApiUrl("userspace/files/"),
          data: formData,
          headers: { 
            "Content-Type": "multipart/form-data" 
          }
        });

        console.log(response.data);
        // Update the UI with the new file
        const newFile = {
          id: response.data.file.id,
          name: response.data.file.name,
          path: response.data.file.path,
          created_date: response.data.file.created_date,
          folder_id: response.data.file.folder_id,
          size: response.data.file.size,
        };
        console.log(newFile);

        setFiles((prev) => [...prev, newFile]);
        showAlert("File uploaded successfully", "success");
      } catch (error) {
        console.error("Error uploading file:", error);
        // Plan-limit rejections (429) carry a user-facing message from the backend.
        const detail = error.response?.data;
        showAlert(detail?.message || detail?.error || "Failed to upload file", "error");
      } finally {
        setLoading(false);
      }
    }

    // Reset the input
    e.target.value = "";
  };

  // Apply search filter
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Apply sorting
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortType) {
      case "Name (A-Z)":
        return a.name.localeCompare(b.name);
      case "Name (Z-A)":
        return b.name.localeCompare(a.name);
      case "Oldest":
        return new Date(a.created_date) - new Date(b.created_date);
      case "Latest":
        return new Date(b.created_date) - new Date(a.created_date);
      case 'Size (Small-Large)':
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if the dropdown is open and the click is outside the dropdown
      if (
        showSortDropdown && 
        sortDropdownRef.current && 
        !sortDropdownRef.current.contains(event.target)
      ) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSortDropdown]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 mt-4 sm:mt-6">
        <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-customPrimary"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          {/* Actions */}
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleUpload}
              className="px-3 sm:px-4 py-2 bg-customPrimary text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm sm:text-base flex-1 sm:flex-none justify-center"
            >
              <Upload size={16} className="hidden sm:block" />
              Upload
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,application/pdf"
              className="hidden"
            />
          
            {/* Sort Dropdown */}
            <div className="relative z-30 flex-1 sm:flex-none min-w-[120px] sm:min-w-[150px]" ref={sortDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSortDropdown(!showSortDropdown);
                }}
                className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-full flex items-center gap-2 focus:outline-none w-full justify-center text-sm sm:text-base"
              >
                {sortType} <ChevronDown size={16} />
              </button>

              {showSortDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      className={`block w-full text-left px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 ${
                        sortType === option ? 'bg-gray-100' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortType(option);
                        setShowSortDropdown(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State or Files Grid */}
      {loading ? (
        <div className="col-span-full flex items-center justify-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Files Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {sortedFiles.map((file, index) => (
              <div key={`${file.id}-${index}`} className="w-full">
                <FileCard
                  file={file}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  onMoveSuccess={handleMoveSuccess}
                  folders={folders}
                />
              </div>
            ))}
          </div>

          {sortedFiles.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              No files found. Try adjusting your search or upload a new file.
            </div>
          )}
        </>
      )}

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
};

export default Files;
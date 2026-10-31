import { FileListSkeleton } from '../../components/Loading/Skeletons';
import useBulkFileActions from '../../hooks/useBulkFileActions';
import LibraryLoadError from "../../components/Cards/LibraryLoadError";
import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import FileList from "../../components/Cards/FileList";
import Alert from "../../components/Cards/Alert";
import { getApiUrl } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import LibraryToolbar from "../../components/Cards/LibraryToolbar";
import { Link } from "react-router-dom";
import { useParams } from 'react-router-dom';

const Files = () => {
  let { folder_id } = useParams();
  if (!folder_id) {
    folder_id = -1;
  }
  console.log(folder_id);
  
  const { authRequest } = useAuth();
  const [files, setFiles] = useState([]);
  const bulkAction = useBulkFileActions(setFiles, folder_id);
  const [folders, setFolders] = useState([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [foldersError, setFoldersError] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState("Latest");
  const [title, setTitle] = useState("All files");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch folder name and files from the API
    setLoading(true);
    fetchFolderAndFiles(folder_id).then((data) => {
      if (data) {
        setFiles(data.files || []);
        setTitle(data?.folder_name || "All files");
      }
      setLoading(false);
    });
    
    // Fetch all folders for the move operation
    fetchFolders();
  }, [folder_id]);

  const fetchFolders = async () => {
    setFoldersLoading(true);
    setFoldersError(false);
    try {
      const response = await authRequest({
        method: "get",
        url: getApiUrl("userspace/folders/"),
      });
      
      console.log("Folders fetched:", response.data);
      setFolders(response.data);
    } catch (error) {
      setFoldersError(true);
      console.error("Error fetching folders:", error);
      showAlert("Failed to fetch folders", "error");
    } finally {
      setFoldersLoading(false);
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
      setLoadError(true);
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
      throw error;
    }
  };

  const handleDelete = (fileName) => {
    const fileIndex = files.findIndex((file) => file.name === fileName);
    const file = files[fileIndex];

      return authRequest({
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
      throw error;
    }
  };

  const handleUpload = () => {
    // Remind users that only PDF files are allowed
    showAlert("Please select PDF files only", "info");
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const uploadedFile = e.target.files[0]; // Get the first file only

    if (uploadedFile) {
      setUploading(true);
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
        setUploading(false);
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

  return (
    <div className="mx-auto max-w-7xl">
      <LibraryToolbar loading={loading} title={title} description="Your saved PDFs, ready for another look." count={sortedFiles.length} query={searchQuery} onQueryChange={setSearchQuery} sort={sortType} onSortChange={setSortType} sortOptions={sortOptions} action={<button disabled={uploading} aria-busy={uploading} onClick={handleUpload} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-auth-accent px-4 text-sm font-semibold text-white hover:bg-auth-hover disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-accent"><Upload size={16} aria-hidden="true" />{uploading ? 'Uploading…' : 'Upload PDF'}</button>}>
        {folder_id !== -1 && <Link to="/folders" className="mb-5 inline-block rounded text-sm text-auth-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">← All folders</Link>}
      </LibraryToolbar>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,application/pdf" className="hidden" />

      {/* Library content */}
      {loadError ? <LibraryLoadError /> : loading ? (
        <FileListSkeleton />
      ) : (
        <>
          {sortedFiles.length > 0 && <FileList onBulkAction={bulkAction} key={`${folder_id}:${searchQuery}:${sortType}`} files={sortedFiles} label={title} onRename={handleRename} onDelete={handleDelete} onMove={handleMove} folders={folders} foldersLoading={foldersLoading} foldersError={foldersError} onRetryFolders={fetchFolders} />}

          {sortedFiles.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-gray-500">
              <h2 className="text-lg font-semibold text-auth-ink">{searchQuery ? 'No matching files' : 'Your next study session starts here'}</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6">{searchQuery ? 'Try another name, or clear your search.' : 'Upload a PDF from Clip Insights to keep your screenshots, notes, and insights together.'}</p>
              <button onClick={searchQuery ? () => setSearchQuery('') : handleUpload} className="mt-5 min-h-11 rounded-lg border border-auth-line bg-white px-4 text-sm font-medium text-auth-ink hover:bg-auth-panel">{searchQuery ? 'Clear search' : 'Upload your first PDF'}</button>
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
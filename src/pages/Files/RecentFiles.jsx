import { FileListSkeleton } from '../../components/Loading/Skeletons';
import useBulkFileActions from '../../hooks/useBulkFileActions';
import LibraryLoadError from "../../components/Cards/LibraryLoadError";
import { useState, useEffect, useCallback } from 'react'
import { ArrowRight } from 'lucide-react'
import FileList from '../../components/Cards/FileList'
import Alert from '../../components/Cards/Alert'
import { getApiUrl } from '../../services/apiService'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const RecentFiles = () => {
    const navigate = useNavigate()
    const { authRequest } = useAuth()
    const [files, setFiles] = useState([])
    const bulkAction = useBulkFileActions(setFiles);
    const [folders, setFolders] = useState([]);
    const [foldersLoading, setFoldersLoading] = useState(true);
    const [foldersError, setFoldersError] = useState(false);
    const [alert, setAlert] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false);

    const fetchRecentFiles = useCallback(async () => {
        setLoading(true)
        setLoadError(false);
        try {
            const response = await authRequest({
                method: "get",
                url: getApiUrl("userspace/files/?number_of_files=4"),
            })

            console.log("Recent files fetched:", response.data)
            setFiles(response.data.files || [])
            setLoading(false)
        } catch (error) {
            setLoadError(true);
            console.error("Error fetching recent files:", error)

            setLoading(false)
        }
    }, [authRequest]);

    const fetchFolders = useCallback(async () => {
        setFoldersLoading(true);
        setFoldersError(false);
        try {
            const response = await authRequest({
                method: "get",
                url: getApiUrl("userspace/folders/"),
            })

            console.log("Folders fetched:", response.data)
            setFolders(response.data)
        } catch (error) {
            setFoldersError(true);
            console.error("Error fetching folders:", error)

        } finally {
            setFoldersLoading(false);
        }
    }, [authRequest]);

    useEffect(() => { fetchRecentFiles(); fetchFolders(); }, [fetchRecentFiles, fetchFolders]);

    const showAlert = (message, type = 'success') => setAlert({ message, type });

    const handleRename = async (oldName, newName) => {
        const fileIndex = files.findIndex((file) => file.name === oldName)
        if (fileIndex === -1) return

        const file = files[fileIndex]
        try {
            const response = await authRequest({
                method: "patch",
                url: getApiUrl("userspace/files/"),
                data: {
                    file_id: file.id,
                    new_name: newName
                }
            })

            console.log(response.data)
            // Update the file name in the UI
            setFiles((prevFiles) => {
                const newFiles = [...prevFiles]
                newFiles[fileIndex] = { ...file, name: newName }
                return newFiles
            })
            showAlert("File renamed successfully", "success")
        } catch (error) {
            console.error("Error renaming file:", error)
            showAlert("Failed to rename file", "error")
      throw error;
        }
    }

    const handleDelete = async (fileName) => {
        const fileIndex = files.findIndex((file) => file.name === fileName)
        if (fileIndex === -1) return

        const file = files[fileIndex]

        try {
            const response = await authRequest({
                method: "delete",
                url: getApiUrl("userspace/files/"),
                data: { file_id: file.id }
            })

            console.log(response.data)
            // Update the UI
            setFiles((prevFiles) =>
                prevFiles.filter((file) => file.name !== fileName)
            )
            showAlert("File deleted successfully", "success")
        } catch (error) {
            console.error("Error deleting file:", error)
            showAlert("Failed to delete file", "error")
        }
    }

    const handleMove = async (fileId, newFolderId) => {
        try {
            const response = await authRequest({
                method: "patch",
                url: getApiUrl("userspace/files/"),
                data: {
                    file_id: fileId,
                    folder_id: newFolderId
                }
            })

            console.log("Move response:", response.data)

            // Update the file's folder_id or remove it from the list
            setFiles(prevFiles =>
                prevFiles.map(file =>
                    file.id === fileId ? { ...file, folder_id: newFolderId } : file
                )
            )

            // Show success message
            showAlert(response.data.message || "File moved successfully", "success")
        } catch (error) {
            console.error("Error moving file:", error)
            showAlert(error.response?.data?.error || "Failed to move file", "error")
            throw error
        }
    }

    const viewFilesPage = () => {
        navigate('/files')
    }

    return (
        // Sized by the parent (Dashboard) container so the section aligns
        // with the cards above instead of centering itself independently.
        <div className="w-full mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Recently saved</h2>
                <button
                    onClick={viewFilesPage}
                    className="min-h-11 px-3 py-2 text-auth-accent rounded-lg flex items-center justify-center gap-2 hover:bg-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent"
                >
                    <span>All files</span>
                    <ArrowRight size={16} aria-hidden="true" />
                </button>
            </div>

            {loadError ? <LibraryLoadError onRetry={fetchRecentFiles} /> : loading ? (
                <FileListSkeleton compact />
            ) : files.length > 0 ? (
                <FileList onBulkAction={bulkAction} files={files} compact label="Recently saved" onRename={handleRename} onDelete={handleDelete} onMove={handleMove} folders={folders} foldersLoading={foldersLoading} foldersError={foldersError} onRetryFolders={fetchFolders} />
            ) : null}

            {!loading && !loadError && files.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-gray-500">
                    <div className="mb-3">
                        <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="text-center">No recent files found.</p>
                </div>
            )}

            {/* Fixed position alert for better visibility on all screen sizes */}
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
    )
}

export default RecentFiles

import React, { useState, useEffect } from 'react'
import { LogIn } from 'lucide-react'
import FileCard from '../../components/Cards/FileCard'
import Alert from '../../components/Cards/Alert'
import { getApiUrl } from '../../services/apiService'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const RecentFiles = () => {
    const navigate = useNavigate()
    const { authRequest } = useAuth()
    const [files, setFiles] = useState([])
    const [folders, setFolders] = useState([])
    const [alert, setAlert] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch recent files from the API
        fetchRecentFiles()
        
        // Fetch all folders for the move operation
        fetchFolders()
    }, [])

    const fetchRecentFiles = async () => {
        setLoading(true)
        try {
            const response = await authRequest({
                method: "get",
                url: getApiUrl("userspace/files/?number_of_files=4"),
            })
            
            console.log("Recent files fetched:", response.data)
            setFiles(response.data.files || [])
            setLoading(false)
        } catch (error) {
            console.error("Error fetching recent files:", error)
            showAlert("Failed to fetch recent files", "error")
            setLoading(false)
        }
    }

    const fetchFolders = async () => {
        try {
            const response = await authRequest({
                method: "get",
                url: getApiUrl("userspace/folders/"),
            })
            
            console.log("Folders fetched:", response.data)
            setFolders(response.data)
        } catch (error) {
            console.error("Error fetching folders:", error)
            showAlert("Failed to fetch folders", "error")
        }
    }

    const showAlert = (message, type = "success") => {
        setAlert({ message, type })
        
        // Auto-dismiss alert after 5 seconds
        setTimeout(() => {
            setAlert(null)
        }, 5000)
    }

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
        }
    }

    const handleMoveSuccess = (message) => {
        showAlert(message, "success")
    }

    const viewFilesPage = () => {
        navigate('/files')
    }

    return (
        // Sized by the parent (Dashboard) container so the section aligns
        // with the cards above instead of centering itself independently.
        <div className="w-full mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Recent Files</h2>
                <button 
                    onClick={viewFilesPage}
                    className="w-full sm:w-auto px-3 py-2 bg-customPrimary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <LogIn size={16} />
                    <span>View Files</span>
                </button>
            </div>

            {/* Files Grid - Progressively increasing columns based on screen size */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {loading ? (
                    <div className="col-span-full flex items-center justify-center py-8">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ) : (
                    files.map((file) => (
                        <FileCard
                            key={`${file.id}`}
                            file={file}
                            onRename={handleRename}
                            onDelete={handleDelete}
                            onMove={handleMove}
                            onMoveSuccess={handleMoveSuccess}
                            folders={folders}
                        />
                    ))
                )}
            </div>

            {!loading && files.length === 0 && (
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
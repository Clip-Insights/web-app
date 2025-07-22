import React, { useState, useEffect, useRef } from "react";
import { MoreHorizontal, File, Folder } from "lucide-react";
import RenamePopup from "./RenamePopup";
import MovePopup from "./MovePopup";

const FileCard = ({ file, onRename, onDelete, onMove, onMoveSuccess, folders = [] }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showRenamePopup, setShowRenamePopup] = useState(false);
  const [showMovePopup, setShowMovePopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const optionsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFileIcon = () => {
    const extension = getFileExtension(file.name).toLowerCase();

    switch (extension) {
      case "pdf":
        return (
          <File size={48} className="text-red-500" />
        );
      default:
        return <File size={48} className="text-customPrimary" />;
    }
  };

  const getFileExtension = (filename) => filename.split(".").pop();

  const getFileNameWithoutExtension = (filename) => {
    const parts = filename.split(".");
    return parts.slice(0, -1).join(".");
  };

  const handleRename = (newName) => {
    if (newName && newName !== getFileNameWithoutExtension(file.name)) {
      const extension = getFileExtension(file.name);
      onRename(file.name, `${newName}.${extension}`);
    }
    setShowRenamePopup(false);
  };

  const handleMove = async (newFolderId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the onMove function passed from the parent
      if (onMove) {
        await onMove(file.id, newFolderId);
      }
      
      setIsLoading(false);
      setShowMovePopup(false);
    } catch (error) {
      console.error("Error moving file:", error);
      setError(error.message || "Failed to move file");
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    onDelete(file.name);
    setShowOptions(false);
  };

  return (
    <div className="relative p-4 bg-white border border-gray-200 rounded-3xl transition-all duration-200 hover:!bg-[#F1F1FF] group">
      {/* Error message */}
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-800 text-xs p-1 rounded-t-3xl text-center">
          {error}
        </div>
      )}
      
      {/* Options Menu */}
      <div className="absolute top-2 right-2" ref={optionsRef}>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none p-1"
          disabled={isLoading}
        >
          <MoreHorizontal size={20} />
        </button>

        {showOptions && (
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <div className="py-1">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setShowOptions(false);
                  setShowRenamePopup(true);
                }}
              >
                Rename
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setShowOptions(false);
                  setShowMovePopup(true);
                }}
              >
                Move
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* File Icon */}
      <div className="flex justify-center mb-3">
        {getFileIcon()}
      </div>

      {/* File Name */}
      <div className="text-center mt-2 truncate" title={file.name}>
        {file.name}
        {isLoading && <span className="ml-1 text-xs text-gray-500">(processing...)</span>}
      </div>

      {/* Open Button */}
      <button
        className="w-full mt-3 py-2 px-4 bg-gray-100 group-hover:bg-white text-gray-800 rounded text-sm text-center"
        onClick={() => window.open(file.path, "_blank")}
        disabled={isLoading}
      >
        Open
      </button>

      {/* Popups */}
      {showRenamePopup && (
        <RenamePopup
          fileName={getFileNameWithoutExtension(file.name)}
          onRename={handleRename}
          onCancel={() => setShowRenamePopup(false)}
        />
      )}

      {showMovePopup && (
        <MovePopup
          folders={folders}
          onSelect={handleMove}
          onCancel={() => setShowMovePopup(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default FileCard;
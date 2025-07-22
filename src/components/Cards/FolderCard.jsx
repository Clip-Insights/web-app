import React, { useState, useEffect, useRef } from "react";
import { MoreHorizontal, Folder } from "lucide-react";
import RenamePopup from "./RenamePopup";

const FolderCard = ({ folderName, itemCount, size, onRename, onDelete, onClick }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showRenamePopup, setShowRenamePopup] = useState(false);
  const menuRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }
    
    // Add event listener when dropdown is open
    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const handleRename = (newName) => {
    if (newName && newName !== folderName) {
      onRename(folderName, newName);
    }
    setShowRenamePopup(false);
  };

  const handleDelete = () => {
    onDelete(folderName);
    setShowOptions(false);
  };

  const sizeMBs = (size) => {
    return (size / 1024 / 1024).toFixed(1);
  };

  return (
    <div 
      className="relative bg-white border border-gray-200 rounded-3xl transition-all duration-200 hover:!bg-[#F1F1FF] cursor-pointer"
      onClick={onClick}
    >
      {/* Options button */}
      <div className="absolute top-2 right-2 z-10" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Stop event from bubbling up
            setShowOptions(!showOptions);
          }}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <MoreHorizontal size={20} />
        </button>
        {showOptions && (
          <div 
            className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200"
            onClick={(e) => e.stopPropagation()} // Stop event from bubbling up
          >
            <div className="py-1">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation(); // Stop event from bubbling up
                  setShowOptions(false);
                  setShowRenamePopup(true);
                }}
              >
                Rename
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation(); // Stop event from bubbling up
                  handleDelete();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Folder content */}
      <div className="p-4">
        <div className="flex justify-center mb-3">
          <Folder size={48} className="text-yellow-400" />
        </div>
        <div className="text-center">
          <p className="font-medium truncate" title={folderName}>
            {folderName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {itemCount} items · {sizeMBs(size)} MB
          </p>
        </div>
      </div>
      {/* Rename Popup */}
      {showRenamePopup && (
        <div onClick={(e) => e.stopPropagation()}>
          <RenamePopup
            fileName={folderName}
            onRename={handleRename}
            onCancel={() => setShowRenamePopup(false)}
            title="Rename Folder"
            label="Folder Name"
          />
        </div>
      )}
    </div>
  );
};

export default FolderCard;
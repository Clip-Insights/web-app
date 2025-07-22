// RenamePopup.jsx - Updated to be more generic
import React, { useState, useEffect, useRef } from "react";

const RenamePopup = ({
  fileName,
  onRename,
  onCancel,
  title = "Rename File",
  label = "File Name",
}) => {
  const [newName, setNewName] = useState(fileName);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on the input field when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onRename(newName.trim());
  };

  return (
    <div className="fixed inset-0 bg-slate-950 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-3">{title}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              ref={inputRef}
              type="text"
              id="itemName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 border rounded-3xl focus:outline-none focus:ring-1 focus:ring-customPrimary placeholder-gray-150 text-md"
            />
          </div>

          <div className="flex justify-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 w-44 text-base font-medium text-customPrimary border-customPrimary border-1 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-customPrimary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 w-44 text-base font-medium text-white bg-customPrimary rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-customPrimary"
              disabled={!newName.trim() || newName.trim() === fileName}
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenamePopup;

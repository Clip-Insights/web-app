import React from "react";
import { Folder } from "lucide-react";

const MovePopup = ({ folders, onSelect, onCancel, isLoading = false }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Move to Folder</h3>
        
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Moving file...</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {folders.length === 0 ? (
                <p className="text-gray-500 text-center py-2">No folders found</p>
              ) : (
                folders.map((folder) => (
                  <button
                    key={folder.id}
                    className="flex items-center w-full p-2 rounded hover:bg-gray-100 transition-colors"
                    onClick={() => onSelect(folder.id)}
                    disabled={isLoading}
                  >
                    <Folder size={20} className="text-yellow-500 mr-2" />
                    <span className="text-left truncate">{folder.name}</span>
                  </button>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="px-4 py-2 w-full mt-4 text-base font-medium text-customPrimary border-customPrimary border-1 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-customPrimary"                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovePopup;
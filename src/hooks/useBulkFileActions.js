import { useAuth } from '../context/AuthContext';
import { applyFileOperation } from '../services/fileService';

export default function useBulkFileActions(setFiles, currentFolderId = -1) {
  const { authRequest } = useAuth();
  return async (ids, action, destination) => {
    const result = await applyFileOperation(authRequest, ids, action, destination);
    setFiles(previous => previous.flatMap(file => {
      if (!result.successfulIds.includes(file.id)) return [file];
      if (action === 'delete') return [];
      if (currentFolderId !== -1 && String(currentFolderId) !== String(destination)) return [];
      return [{ ...file, folder_id: destination }];
    }));
    return result;
  };
}

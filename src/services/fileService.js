import { getApiUrl } from './apiService';

// Each existing endpoint changes one file; retain per-file results on partial failure.
export async function applyFileOperation(authRequest, ids, action, folderId) {
  const successfulIds = [];
  const failedIds = [];
  for (const id of ids) {
    try {
      await authRequest({
        method: action === 'delete' ? 'delete' : 'patch',
        url: getApiUrl('userspace/files/'),
        data: action === 'delete' ? { file_id: id } : { file_id: id, folder_id: folderId },
      });
      successfulIds.push(id);
    } catch {
      failedIds.push(id);
    }
  }
  return { successfulIds, failedIds };
}

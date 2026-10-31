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


export function validateUpload(file, plan) {
  if (file.type !== 'application/pdf') return 'Choose a PDF file. Other file types aren’t supported for uploads yet.';
  if (!file.size) return 'This file is empty. Choose a PDF with content.';
  const limit = Number(plan?.max_file_size_mb);
  if (!Number.isFinite(limit) || limit <= 0) return 'We couldn’t confirm your upload allowance. Please try again.';
  if (file.size > limit * 1024 * 1024) return `This file exceeds your plan’s ${limit} MB per-file limit. Choose a smaller PDF.`;
  return null;
}

import { FolderOptionsSkeleton } from '../Loading/Skeletons';
import PropTypes from 'prop-types';
import { Folder, ArrowRight } from 'lucide-react';
import LibraryDialog from './LibraryDialog';

export default function MovePopup({ folders, onSelect, onCancel, isLoading = false, foldersLoading = false, foldersError = false, onRetryFolders, error }) {
  return <LibraryDialog title="Move to folder" onClose={onCancel} busy={isLoading}>
    <p className="mb-4 text-sm text-auth-muted">Choose a home for this file.</p>
    {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
    {isLoading ? <p role="status" className="py-6 text-center text-sm text-auth-muted">Moving your file…</p> : foldersLoading ? <FolderOptionsSkeleton /> : foldersError ? <div role="alert" className="py-4 text-sm text-auth-muted"><p>Folder destinations couldn’t be loaded.</p>{onRetryFolders && <button type="button" onClick={onRetryFolders} className="mt-2 min-h-11 rounded-lg border border-auth-line px-4 hover:bg-auth-panel">Retry folders</button>}</div> : <div className="max-h-64 space-y-1 overflow-y-auto">{folders.length ? folders.map(folder => <button key={folder.id} onClick={() => onSelect(folder.id)} className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-auth-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent"><Folder size={20} className="shrink-0 text-auth-accent" aria-hidden="true" /><span className="truncate">{folder.name}</span><ArrowRight size={16} className="ml-auto shrink-0 text-auth-muted" aria-hidden="true" /></button>) : <p className="py-4 text-sm text-auth-muted">No folders yet. Create one in Folders, then move your file here.</p>}</div>}
    <button disabled={isLoading} onClick={onCancel} className="mt-6 min-h-11 w-full rounded-lg border border-auth-line text-sm hover:bg-auth-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent disabled:opacity-50">Cancel</button>
  </LibraryDialog>;
}
MovePopup.propTypes = { foldersLoading: PropTypes.bool, foldersError: PropTypes.bool, onRetryFolders: PropTypes.func, folders: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), name: PropTypes.string })).isRequired, onSelect: PropTypes.func.isRequired, onCancel: PropTypes.func.isRequired, isLoading: PropTypes.bool, error: PropTypes.string };

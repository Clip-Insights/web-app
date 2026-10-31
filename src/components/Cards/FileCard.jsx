import { Skeleton } from '../Loading/Skeletons';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Folder } from 'lucide-react';
import SelectionCheckbox from './SelectionCheckbox';
import FileTypeIcon from './FileTypeIcon';
import RenamePopup from './RenamePopup';
import MovePopup from './MovePopup';
import CardActions from './CardActions';

export default function FileCard({ file, onRename, onDelete, onMove, folders = [], compact = false, selection, foldersLoading = false, foldersError = false, onRetryFolders }) {
  const [dialog, setDialog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastDot = file.name.lastIndexOf('.');
  const name = lastDot > 0 ? file.name.slice(0, lastDot) : file.name;
  const extension = lastDot > 0 ? file.name.slice(lastDot + 1) : 'File';
  const hasFolder = file.folder_id != null && !['-1', '0', '', '00000000-0000-0000-0000-000000000000'].includes(String(file.folder_id));
  const folderName = folders.find(folder => String(folder.id) === String(file.folder_id))?.name;
  const size = Number.isFinite(file.size) ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : null;
  const date = file.created_date ? new Date(file.created_date) : null;
  const dateLabel = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  const move = async (folderId) => {
    setLoading(true); setError(null);
    try { await onMove?.(file.id, folderId); setDialog(null); }
    catch (failure) { setError(failure.message || 'Could not move this file. Please try again.'); }
    finally { setLoading(false); }
  };
  return (
    <tr aria-selected={selection?.checked} onClick={(event) => {
      if (!selection || selection.disabled || event.target.closest('button, input')) return;
      if (event.target.closest('a') && !event.ctrlKey && !event.metaKey && !event.shiftKey) return;
      event.preventDefault();
      selection.onSelect(file.id, event);
    }} className={`group transition-colors ${selection?.checked ? 'bg-blue-50' : 'hover:bg-auth-panel/60'}`}>
      {selection && <td className="border-t border-auth-line pl-1.5 align-middle"><SelectionCheckbox label={`Select ${file.name}`} checked={selection.checked} disabled={selection.disabled} onClick={(event) => selection.onSelect(file.id, event)} /></td>}
      <td className="border-t border-auth-line px-4 py-3 align-middle sm:px-5">
        <a href={file.path} target="_blank" rel="noopener noreferrer" aria-label={`Open ${file.name}`} className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-auth-accent">
          <FileTypeIcon name={file.name} />
          <span className="min-w-0">
            <h2 className="line-clamp-2 break-words text-sm font-medium leading-5 text-auth-ink group-hover:text-auth-accent" title={file.name}>{name}</h2>
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tabular-nums text-auth-muted">
              {hasFolder ? (foldersLoading && !folderName ? <span role="status" aria-label="Loading folder name"><Skeleton className="h-3 w-24" /></span> : <span className="inline-flex min-w-0 items-center gap-1.5" title={folderName ? `Folder: ${folderName}` : 'Folder name unavailable'}><Folder size={12} className="shrink-0" aria-hidden="true" /><span className="max-w-48 truncate">{folderName || (foldersError ? 'Folder unavailable' : 'In a folder')}</span></span>) : <span className="text-auth-subtle">No folder</span>}
              {compact && size && <span>{size}</span>}
              {!compact && size && <span className="sm:hidden">{size}</span>}
              <span className="md:hidden">{dateLabel || ''}</span>
              {loading && <span role="status">Updating…</span>}
            </span>
          </span>
        </a>
      </td>
      <td className="hidden border-t border-auth-line px-3 py-3 align-middle text-xs tabular-nums text-auth-muted md:table-cell">{dateLabel || '—'}</td>
      {!compact && <td className="hidden border-t border-auth-line px-3 py-3 text-right align-middle text-xs tabular-nums text-auth-muted sm:table-cell">{size || '—'}</td>}
      <td className="relative border-t border-auth-line align-middle">
        <CardActions name={file.name} disabled={loading || selection?.disabled} actions={[
          { label: 'Rename', onClick: () => setDialog('rename') },
          { label: 'Move to folder', onClick: () => { setError(null); setDialog('move'); } },
          { label: 'Delete', destructive: true, onClick: async () => { setLoading(true); try { await onDelete(file.name); } finally { setLoading(false); } } },
        ]} />
      {dialog === 'rename' && <RenamePopup fileName={name} onCancel={() => setDialog(null)} onRename={async (value) => { if (value && value !== name) await onRename(file.name, lastDot > 0 ? `${value}.${extension}` : value); setDialog(null); }} />}
      {dialog === 'move' && <MovePopup foldersLoading={foldersLoading} foldersError={foldersError} onRetryFolders={onRetryFolders} error={error} folders={folders} onSelect={move} onCancel={() => setDialog(null)} isLoading={loading} />}
      </td>
    </tr>
  );
}
FileCard.propTypes = { foldersLoading: PropTypes.bool, foldersError: PropTypes.bool, onRetryFolders: PropTypes.func, file: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), name: PropTypes.string.isRequired, path: PropTypes.string, size: PropTypes.number, created_date: PropTypes.string, folder_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) }).isRequired, onRename: PropTypes.func.isRequired, onDelete: PropTypes.func.isRequired, onMove: PropTypes.func, folders: PropTypes.array, compact: PropTypes.bool, selection: PropTypes.shape({ checked: PropTypes.bool, disabled: PropTypes.bool, onSelect: PropTypes.func.isRequired }) };

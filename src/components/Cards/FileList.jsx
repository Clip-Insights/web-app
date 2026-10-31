import { useState } from 'react';
import { FolderInput, Trash2, X } from 'lucide-react';
import useFileSelection from '../../hooks/useFileSelection';
import LibraryDialog from './LibraryDialog';
import MovePopup from './MovePopup';
import PropTypes from 'prop-types';
import FileCard from './FileCard';
import SelectionCheckbox from './SelectionCheckbox';

export default function FileList({ files, compact = false, label = 'Saved files', onBulkAction, ...actions }) {
  const { selected, select, setIds, clear } = useFileSelection(files);
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const selectable = Boolean(onBulkAction);
  const run = async (action, destination) => {
    if (busy) return;
    setBusy(true); setFeedback('');
    try {
      const result = await onBulkAction(selected, action, destination);
      setIds(result.failedIds);
      setFeedback(`${result.successfulIds.length} ${action === 'delete' ? 'deleted' : 'moved'}${result.failedIds.length ? `; ${result.failedIds.length} could not be changed. They remain selected. Try again.` : '.'}`);
      setDialog(null);
    } catch { setFeedback('The operation could not finish. Please try again.'); }
    finally { setBusy(false); }
  };
  return (
    <section aria-label={label} onKeyDown={(event) => {
      if (!selectable || busy || event.target.closest('input, select, textarea, dialog')) return;
      if (event.key === 'Escape') clear();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') { event.preventDefault(); setIds(files.map(file => file.id)); }
    }}>
      {selectable && selected.length > 0 && <div className="mb-3 flex min-h-11 flex-wrap items-center gap-2 text-xs text-auth-muted">
        <span className="mr-2">{selected.length} selected</span>
          <button type="button" disabled={busy} onClick={() => setDialog('move')} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-auth-line bg-white px-3 text-sm text-auth-ink hover:bg-auth-panel disabled:opacity-50"><FolderInput size={16} />Move</button>
          <button type="button" disabled={busy} onClick={() => setDialog('delete')} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-auth-line bg-white px-3 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={16} />Delete</button>
          <button type="button" disabled={busy} onClick={clear} aria-label="Clear selection" className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-auth-panel"><X size={16} /></button>
        {busy && <span role="status">Updating files…</span>}
      </div>}
      {feedback && <p role="status" className="mb-3 text-sm text-auth-muted">{feedback}</p>}
    <div className="rounded-xl border border-auth-line bg-white">
      <table aria-label={label} className="w-full table-fixed border-separate border-spacing-0 text-left">
        <colgroup>
          {selectable && <col className="w-14" />}
          <col />
          <col className="hidden w-36 md:table-column" />
          {!compact && <col className="hidden w-24 sm:table-column" />}
          <col className="w-14" />
        </colgroup>
        <thead className="text-xs font-medium text-auth-muted">
          <tr>
            {selectable && <th scope="col" className="pl-1.5"><SelectionCheckbox label="Select all visible files" checked={files.length > 0 && selected.length === files.length} mixed={selected.length > 0 && selected.length < files.length} disabled={busy} onChange={() => selected.length === files.length ? clear() : setIds(files.map(file => file.id))} /></th>}
            <th scope="col" className="px-4 py-3 font-medium sm:px-5">Name</th>
            <th scope="col" className="hidden w-36 px-3 py-3 font-medium md:table-cell">Date saved</th>
            {!compact && <th scope="col" className="hidden w-24 px-3 py-3 text-right font-medium sm:table-cell">Size</th>}
            <th scope="col" className="w-14"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => <FileCard key={file.id} file={file} compact={compact} selection={selectable ? { checked: selected.includes(file.id), onSelect: select, disabled: busy } : undefined} {...actions} />)}
        </tbody>
      </table>
    </div>
    {dialog === 'move' && <MovePopup foldersLoading={actions.foldersLoading} foldersError={actions.foldersError} onRetryFolders={actions.onRetryFolders} folders={actions.folders || []} onSelect={(id) => run('move', id)} onCancel={() => setDialog(null)} isLoading={busy} />}
    {dialog === 'delete' && <LibraryDialog title={`Delete ${selected.length} ${selected.length === 1 ? 'file' : 'files'}?`} onClose={() => setDialog(null)} busy={busy}>
      <p className="text-sm leading-6 text-auth-muted">This permanently deletes the selected files from your account.</p>
      <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={busy} onClick={() => setDialog(null)} className="min-h-11 rounded-lg border border-auth-line px-4 text-sm">Cancel</button><button type="button" disabled={busy} onClick={() => run('delete')} className="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Deleting…' : 'Delete files'}</button></div>
    </LibraryDialog>}
    </section>
  );
}

FileList.propTypes = {
  files: PropTypes.array.isRequired,
  compact: PropTypes.bool,
  label: PropTypes.string,
  onBulkAction: PropTypes.func,
  folders: PropTypes.array,
  foldersLoading: PropTypes.bool, foldersError: PropTypes.bool, onRetryFolders: PropTypes.func,
};

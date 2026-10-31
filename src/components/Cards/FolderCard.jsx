import { useState } from 'react';
import PropTypes from 'prop-types';
import { Folder } from 'lucide-react';
import RenamePopup from './RenamePopup';
import CardActions from './CardActions';

export default function FolderCard({ folderName, itemCount = 0, size = 0, onRename, onDelete, onClick }) {
  const [renaming, setRenaming] = useState(false);
  return (
    <article className="group relative min-w-0 rounded-xl border border-auth-line bg-white transition-colors hover:border-auth-field">
      <CardActions name={folderName} actions={[
        { label: 'Rename', onClick: () => setRenaming(true) },
        { label: 'Delete', destructive: true, onClick: () => onDelete(folderName) },
      ]} />
      <button type="button" onClick={onClick} className="flex min-h-20 w-full items-center gap-3 rounded-xl py-4 pl-4 pr-14 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-accent">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-auth-panel text-auth-accent"><Folder size={23} strokeWidth={1.5} aria-hidden="true" /></span>
        <span className="min-w-0">
          <h2 className="line-clamp-2 break-words text-sm font-medium leading-5 text-auth-ink" title={folderName}>{folderName}</h2>
          <span className="mt-1 block text-xs tabular-nums text-auth-muted">{itemCount} {itemCount === 1 ? 'file' : 'files'}<span className="mx-2">·</span>{(size / 1024 / 1024).toFixed(1)} MB</span>
        </span>
      </button>
      {renaming && <RenamePopup fileName={folderName} title="Rename folder" label="Folder name" onCancel={() => setRenaming(false)} onRename={(name) => { if (name && name !== folderName) onRename(folderName, name); setRenaming(false); }} />}
    </article>
  );
}
FolderCard.propTypes = { folderName: PropTypes.string.isRequired, itemCount: PropTypes.number, size: PropTypes.number, onRename: PropTypes.func.isRequired, onDelete: PropTypes.func.isRequired, onClick: PropTypes.func.isRequired };

import { useState } from 'react';
import PropTypes from 'prop-types';
import LibraryDialog from './LibraryDialog';

export default function RenamePopup({ fileName, onRename, onCancel, title = 'Rename file', label = 'File name' }) {
  const [name, setName] = useState(fileName);
  return <LibraryDialog title={title} onClose={onCancel}><form onSubmit={(event) => { event.preventDefault(); if (name.trim() && name.trim() !== fileName) onRename(name.trim()); }}>
    <label htmlFor="itemName" className="mb-2 block text-sm font-medium">{label}</label>
    <input id="itemName" value={name} onChange={(event) => setName(event.target.value)} autoFocus className="h-12 w-full rounded-lg border border-auth-field px-3 text-sm focus:border-auth-accent focus:outline-none focus:ring-1 focus:ring-auth-accent" />
    <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onCancel} className="min-h-11 rounded-lg border border-auth-line px-4 text-sm hover:bg-auth-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">Cancel</button><button type="submit" disabled={!name.trim() || name.trim() === fileName} className="min-h-11 rounded-lg bg-auth-accent px-4 text-sm font-semibold text-white hover:bg-auth-hover disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-accent">Save name</button></div>
  </form></LibraryDialog>;
}
RenamePopup.propTypes = { fileName: PropTypes.string.isRequired, onRename: PropTypes.func.isRequired, onCancel: PropTypes.func.isRequired, title: PropTypes.string, label: PropTypes.string };

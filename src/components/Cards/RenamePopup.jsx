import { useState } from 'react';
import PropTypes from 'prop-types';
import LibraryDialog from './LibraryDialog';

export default function RenamePopup({ fileName, onRename, onCancel, title = 'Rename file', label = 'File name' }) {
  const [name, setName] = useState(fileName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    if (busy || !name.trim() || name.trim() === fileName) return;
    setBusy(true); setError('');
    try { await onRename(name.trim()); }
    catch { setError('The name couldn’t be saved. Please try again.'); }
    finally { setBusy(false); }
  };
  return <LibraryDialog title={title} onClose={onCancel} busy={busy}><form onSubmit={submit}>
    {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
    <label htmlFor="itemName" className="mb-2 block text-sm font-medium">{label}</label>
    <input disabled={busy} id="itemName" value={name} onChange={(event) => setName(event.target.value)} autoFocus className="h-12 w-full rounded-lg border border-auth-field px-3 text-sm focus:border-auth-accent focus:outline-none focus:ring-1 focus:ring-auth-accent" />
    <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={busy} onClick={onCancel} className="min-h-11 rounded-lg border border-auth-line px-4 text-sm hover:bg-auth-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">Cancel</button><button type="submit" disabled={busy || !name.trim() || name.trim() === fileName} className="min-h-11 rounded-lg bg-auth-accent px-4 text-sm font-semibold text-white hover:bg-auth-hover disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-accent">{busy ? 'Saving…' : 'Save name'}</button></div>
  </form></LibraryDialog>;
}
RenamePopup.propTypes = { fileName: PropTypes.string.isRequired, onRename: PropTypes.func.isRequired, onCancel: PropTypes.func.isRequired, title: PropTypes.string, label: PropTypes.string };

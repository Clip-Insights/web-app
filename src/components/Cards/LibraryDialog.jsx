import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

export default function LibraryDialog({ title, onClose, busy = false, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    return () => { element.close(); previous?.focus(); };
  }, []);
  return createPortal(<dialog ref={dialog} aria-label={title} aria-busy={busy} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-xl border border-auth-line bg-white p-6 text-auth-ink shadow-xl backdrop:bg-auth-ink/30"><h2 className="mb-5 text-xl font-semibold tracking-tight">{title}</h2>{children}</dialog>, document.body);
}
LibraryDialog.propTypes = { title: PropTypes.string.isRequired, onClose: PropTypes.func.isRequired, busy: PropTypes.bool, children: PropTypes.node.isRequired };

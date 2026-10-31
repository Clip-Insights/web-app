import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { MoreHorizontal } from 'lucide-react';

export default function CardActions({ name, disabled = false, actions }) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => { if (!container.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [open]);
  return (
    <div ref={container} className={`absolute right-2 top-2 ${open ? 'z-30' : 'z-10'}`}>
      <button ref={trigger} type="button" aria-label={`Actions for ${name}`} aria-expanded={open} disabled={disabled} onClick={() => setOpen(!open)} className="flex h-11 w-11 items-center justify-center rounded-lg text-auth-muted transition-colors hover:bg-auth-panel hover:text-auth-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent disabled:opacity-50"><MoreHorizontal size={20} aria-hidden="true" /></button>
      {open && <div className="absolute right-0 mt-1 w-40 rounded-lg border border-auth-line bg-white p-1 shadow-lg">{actions.map(({ label, onClick, destructive }) => <button key={label} type="button" onClick={() => { setOpen(false); trigger.current?.focus(); onClick(); }} className={`block min-h-11 w-full rounded-md px-3 py-2 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent ${destructive ? 'text-red-700 hover:bg-red-50' : 'text-auth-ink hover:bg-auth-panel'}`}>{label}</button>)}</div>}
    </div>
  );
}
CardActions.propTypes = { name: PropTypes.string.isRequired, disabled: PropTypes.bool, actions: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string.isRequired, onClick: PropTypes.func.isRequired, destructive: PropTypes.bool })).isRequired };

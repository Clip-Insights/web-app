import { useEffect, useRef } from 'react';
import { Check, Minus } from 'lucide-react';
import PropTypes from 'prop-types';

export default function SelectionCheckbox({ label, checked, mixed = false, disabled = false, onClick, onChange }) {
  const input = useRef(null);
  useEffect(() => { input.current.indeterminate = mixed; }, [mixed]);
  return <label onClick={event => event.stopPropagation()} className="relative flex h-11 w-11 shrink-0 items-center justify-center">
    <input ref={input} type="checkbox" aria-label={label} checked={checked} disabled={disabled} readOnly={!onChange} onClick={onClick} onChange={onChange} className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed" />
    <span aria-hidden="true" className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-auth-accent peer-focus-visible:ring-offset-2 peer-disabled:opacity-50 ${checked || mixed ? 'border-auth-accent bg-auth-accent text-white' : 'border-auth-field bg-white peer-hover:border-auth-accent'}`}>
      {mixed ? <Minus size={12} strokeWidth={2.5} /> : checked ? <Check size={12} strokeWidth={2.5} /> : null}
    </span>
  </label>;
}
SelectionCheckbox.propTypes = { label: PropTypes.string.isRequired, checked: PropTypes.bool.isRequired, mixed: PropTypes.bool, disabled: PropTypes.bool, onClick: PropTypes.func, onChange: PropTypes.func };

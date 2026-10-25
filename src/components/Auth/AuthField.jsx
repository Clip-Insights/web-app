import { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthField({ label, hint, type = 'text', id, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">{label}</label>
      <div className="relative">
        <input
          {...inputProps}
          id={id}
          type={isPassword && visible ? 'text' : type}
          required
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={`min-h-12 w-full rounded-lg border !border-auth-field bg-white px-4 text-base text-auth-ink outline-none transition-colors placeholder:text-auth-muted hover:!border-auth-muted focus:!border-auth-accent focus:ring-2 focus:ring-auth-accent/20 disabled:bg-auth-panel ${isPassword ? 'pr-12' : ''}`}
        />
        {isPassword && (
          <button type="button" aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg text-auth-muted hover:text-auth-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">
            {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {hint && <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-auth-muted">{hint}</p>}
    </div>
  );
}

AuthField.propTypes = {
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string.isRequired,
};

import PropTypes from 'prop-types';
import { RotateCcw } from 'lucide-react';

export default function ResourceError({ title, onRetry }) {
  return <section role="alert" className="flex h-full flex-col justify-center rounded-xl border border-auth-line bg-white p-6"><h2 className="text-sm font-semibold text-auth-ink">{title}</h2><p className="mt-2 text-sm leading-6 text-auth-muted">Check your connection and try again.</p><button type="button" onClick={onRetry} className="mt-4 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border border-auth-line px-4 text-sm font-medium text-auth-ink hover:bg-auth-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent"><RotateCcw size={15} aria-hidden="true" />Try again</button></section>;
}
ResourceError.propTypes = { title: PropTypes.string.isRequired, onRetry: PropTypes.func.isRequired };

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default function LibraryLoadError({ onRetry = () => window.location.reload(), unavailable = false }) {
  return <div role="alert" className="rounded-xl border border-auth-line bg-white px-6 py-10 text-center"><h2 className="text-lg font-semibold text-auth-ink">{unavailable ? 'This folder isn’t available' : 'Your library couldn’t load'}</h2><p className="mt-3 text-sm text-auth-muted">{unavailable ? 'It may have been removed, or you may not have access to it.' : 'Check your connection, then try again.'}</p><div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={onRetry} className="min-h-11 rounded-lg border border-auth-line px-4 text-sm font-medium text-auth-ink hover:bg-auth-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">Try again</button>{unavailable && <Link to="/folders" className="inline-flex min-h-11 items-center rounded-lg bg-auth-accent px-4 text-sm font-medium text-white hover:bg-auth-hover">All folders</Link>}</div></div>;
}
LibraryLoadError.propTypes = { onRetry: PropTypes.func, unavailable: PropTypes.bool };

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react';

export function AuthSubmit({ busy, children }) {
  return <button type="submit" disabled={busy} aria-busy={busy} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-auth-accent px-4 text-sm font-semibold text-white hover:bg-auth-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-auth-accent disabled:cursor-wait disabled:opacity-60">{busy ? <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}{children}{!busy && <ArrowRight size={18} aria-hidden="true" />}</button>;
}
AuthSubmit.propTypes = { busy: PropTypes.bool, children: PropTypes.node.isRequired };

export function BackToSignIn({ to = '/login' }) {
  return <Link to={to} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded text-sm text-auth-muted hover:text-auth-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent"><ArrowLeft size={16} aria-hidden="true" />Back to sign in</Link>;
}
BackToSignIn.propTypes = { to: PropTypes.string };

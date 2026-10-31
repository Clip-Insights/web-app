import PropTypes from 'prop-types';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export default function RecoveryScreen({ title, description, retry, home = '/login', homeLabel = 'Back to sign in' }) {
  return <main className="flex min-h-screen flex-col bg-auth-panel px-6 py-8 text-auth-ink sm:px-12">
    <a href="https://clipinsights.org" className="w-fit rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent"><img src="/Logo/wordmark.svg" alt="Clip Insights" className="h-8 w-auto" /></a>
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16"><p className="mb-4 text-xs font-semibold uppercase tracking-widest text-auth-muted">A little help getting back</p><h1 className="text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-4 text-sm leading-6 text-auth-muted">{description}</p><div className="mt-8 flex flex-wrap gap-3">{retry && <button type="button" onClick={retry} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-auth-accent px-4 text-sm font-semibold text-white hover:bg-auth-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-auth-accent"><RotateCcw size={16} aria-hidden="true" />Try again</button>}<a href={home} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-auth-line px-4 text-sm font-medium hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent"><ArrowLeft size={16} aria-hidden="true" />{homeLabel}</a></div></div>
    <a href="https://clipinsights.org/contact" className="inline-flex min-h-11 w-fit items-center rounded py-2 text-xs text-auth-muted underline underline-offset-4">Contact support</a>
  </main>;
}
RecoveryScreen.propTypes = { title: PropTypes.string.isRequired, description: PropTypes.string.isRequired, retry: PropTypes.func, home: PropTypes.string, homeLabel: PropTypes.string };

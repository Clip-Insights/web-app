import PropTypes from 'prop-types';
import '@fontsource/inter/600.css';
import { ArrowUpRight, FileText, ScanLine } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-auth-ink lg:grid lg:grid-cols-2">
      <div className="flex min-h-screen flex-col px-6 py-8 sm:px-12 lg:px-16 lg:py-10 xl:px-24">
        <a href="https://clipinsights.org" aria-label="Clip Insights home" className="w-fit rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-auth-accent">
          <img src="/Logo/wordmark.svg" alt="Clip Insights" className="h-8 w-auto" />
        </a>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12 lg:py-10">
          {children}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-4 text-xs text-auth-muted">
          <span>Capture. Understand. Keep.</span>
          <a href="https://clipinsights.org/contact" className="inline-flex min-h-6 items-center gap-1 rounded hover:text-auth-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">
            Need a hand? <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </footer>
      </div>
      <aside aria-label="A look inside Clip Insights" className="hidden border-l border-auth-line bg-auth-panel px-12 py-10 lg:flex lg:flex-col lg:justify-center xl:px-20">
        <div className="mx-auto w-full max-w-lg">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-auth-muted">A little less replaying</p>
          <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight">More of what you learn, stays with you.</h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-auth-muted">Turn the moments that matter into notes you can come back to.</p>
          <div className="mt-8 overflow-hidden rounded-xl border border-auth-line bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-auth-line px-6 py-3">
              <span className="text-sm font-semibold">Your next good idea</span>
              <span className="rounded bg-auth-panel px-2 py-1 text-xs text-auth-muted">Study notes</span>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-start gap-4">
                <span className="rounded bg-auth-panel px-2 py-1 text-xs font-semibold tabular-nums text-auth-accent">02:15</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-auth-muted">The idea worth keeping</p>
                  <p className="mt-2 text-sm leading-6">Close the video. Explain the idea in your own words.</p>
                </div>
              </div>
              <div className="my-4 ml-16 flex items-center justify-center gap-3 rounded-lg bg-auth-olive px-4 py-4 text-sm">
                <span>Watch</span><span aria-hidden="true">→</span><span className="rounded-full border border-auth-muted px-3 py-2">Explain</span><span aria-hidden="true">→</span><span>Practice</span>
              </div>
              <div className="flex items-start gap-4 border-t border-auth-line pt-4">
                <span className="rounded bg-auth-panel px-2 py-1 text-xs font-semibold tabular-nums text-auth-accent">04:32</span>
                <p className="text-sm leading-6">If a step is hard to explain, that’s the part to revisit.</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-auth-line px-6 py-3 text-xs text-auth-muted">
              <span className="flex items-center gap-2"><FileText size={15} aria-hidden="true" /> From video to something you keep.</span>
              <ScanLine size={16} aria-hidden="true" />
            </div>
          </div>
          <p className="mt-4 text-xs text-auth-muted">Timestamped notes · Screenshots · PDF exports</p>
        </div>
      </aside>
    </div>
  );
}

AuthLayout.propTypes = { children: PropTypes.node.isRequired };

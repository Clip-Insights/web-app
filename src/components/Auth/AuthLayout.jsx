import PropTypes from 'prop-types';
import LearningPreview from './LearningPreview';
import '@fontsource/inter/600.css';
import { ArrowUpRight } from 'lucide-react';

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
      <LearningPreview />
    </div>
  );
}

AuthLayout.propTypes = { children: PropTypes.node.isRequired };

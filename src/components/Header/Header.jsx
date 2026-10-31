import { Link } from 'react-router-dom';
import AccountMenu from './AccountMenu';
import PropTypes from 'prop-types';
import { Menu } from 'lucide-react';

export default function Header({ title, packagePlan, onToggleSidebar }) {
  return <header className="sticky top-0 z-40 border-b border-auth-line bg-white">
    <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 md:px-8">
      <div className="flex items-center gap-3"><button type="button" onClick={() => onToggleSidebar()} aria-label="Open navigation" className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-auth-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent md:hidden"><Menu size={21} /></button><p className="text-sm font-medium text-auth-muted">Workspace <span className="mx-3 text-auth-line" aria-hidden="true">/</span><span className="text-auth-ink">{title}</span></p></div>
      <div className="flex items-center gap-4">{packagePlan && <Link to="/pricing" className="rounded-md border border-auth-line px-3 py-1.5 text-xs font-medium text-auth-muted hover:border-auth-accent hover:text-auth-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">{packagePlan.name} plan</Link>}<AccountMenu /></div>
    </div>
  </header>;
}
Header.propTypes = { title: PropTypes.string, packagePlan: PropTypes.shape({ name: PropTypes.string }), onToggleSidebar: PropTypes.func.isRequired };

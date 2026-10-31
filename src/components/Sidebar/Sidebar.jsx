import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { LayoutDashboard, Files, Folder, BookOpen, CreditCard, LogOut, CircleHelp, ArrowUpRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const destinations = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
  { label: 'Files', path: '/files', icon: Files },
  { label: 'Folders', path: '/folders', icon: Folder },
  { label: 'Get started', path: '/get-started', icon: BookOpen },
  { label: 'Pricing', path: '/pricing', icon: CreditCard },
];
export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const navigation = useRef(null);
  useEffect(() => {
    if (!isOpen || !window.matchMedia('(max-width: 767px)').matches) return;
    const previous = document.activeElement;
    const panel = navigation.current;
    const focusable = () => [...panel.querySelectorAll('a[href], button:not([disabled])')].filter(element => element.getClientRects().length);
    focusable()[0]?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const next = event.shiftKey ? elements.at(-1) : elements[0];
      const edge = event.shiftKey ? elements[0] : elements.at(-1);
      if (document.activeElement === edge) { event.preventDefault(); next?.focus(); }
    };
    panel.addEventListener('keydown', onKeyDown);
    return () => { panel.removeEventListener('keydown', onKeyDown); previous?.focus(); };
  }, [isOpen, setIsOpen]);
  return <>
    {isOpen && <button type="button" aria-label="Close navigation" onClick={() => setIsOpen(false)} className="fixed inset-0 z-50 bg-auth-ink/30 md:hidden" />}
    <aside ref={navigation} aria-label="Workspace navigation" className={`fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r border-auth-line bg-white transition-transform motion-reduce:transition-none md:sticky md:top-0 md:h-screen md:translate-x-0 md:visible ${isOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}>
      <div className="flex min-h-16 items-center justify-between px-6"><a href="https://clipinsights.org" aria-label="Clip Insights home" className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent"><img src="/Logo/wordmark.svg" alt="Clip Insights" className="w-40" /></a><button type="button" aria-label="Close navigation" onClick={() => setIsOpen(false)} className="-mr-3 flex h-11 w-11 items-center justify-center rounded-lg text-auth-muted md:hidden"><X size={20} /></button></div>
      <nav className="flex-1 overflow-y-auto px-3 py-8"><p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-auth-muted">Your workspace</p>{destinations.map(({ label, path, icon: Icon, end }) => <NavLink key={path} to={path} end={end} onClick={() => setIsOpen(false)} className={({isActive}) => `mb-1 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent ${isActive ? 'bg-auth-panel text-auth-accent' : 'text-auth-muted hover:bg-auth-panel hover:text-auth-ink'}`}><Icon size={19} strokeWidth={1.6} aria-hidden="true" />{label}</NavLink>)}</nav>
      <div className="mx-3 border-t border-auth-line py-3"><a href="https://clipinsights.org/contact" target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-auth-muted transition-colors hover:bg-auth-panel hover:text-auth-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent"><CircleHelp size={18} aria-hidden="true" /><span className="flex-1">Help & support</span><ArrowUpRight size={14} aria-hidden="true" /></a></div>
      <button type="button" onClick={async () => { setIsOpen(false); await logout(); navigate('/login'); }} className="mx-3 mb-5 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-auth-muted hover:bg-auth-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent"><LogOut size={18} aria-hidden="true" />Sign out</button>
    </aside>
  </>;
}
Sidebar.propTypes = { isOpen: PropTypes.bool.isRequired, setIsOpen: PropTypes.func.isRequired };

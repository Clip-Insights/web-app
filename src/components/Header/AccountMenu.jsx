import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleUserRound, Settings, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AccountMenu() {
  const details = useRef(null);
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const closeOutside = event => { if (!details.current?.contains(event.target)) details.current?.removeAttribute('open'); };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  const close = () => details.current?.removeAttribute('open');
  const itemClass = 'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-auth-ink hover:bg-auth-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent';
  if (!isAuthenticated) return <Link to="/login" className={itemClass}>Sign in</Link>;
  return <details ref={details} className="relative" onKeyDown={event => {
    if (event.key === 'Escape') { close(); details.current.querySelector('summary').focus(); }
  }}>
    <summary aria-label="Your account" className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full text-auth-muted hover:bg-auth-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent [&::-webkit-details-marker]:hidden"><CircleUserRound size={25} strokeWidth={1.3} aria-hidden="true" /></summary>
    <nav aria-label="Account" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-auth-line bg-white p-2 shadow-lg">
      <Link to="/settings" onClick={close} className={itemClass}><Settings size={16} aria-hidden="true" />Account settings</Link>
      <Link to="/pricing" onClick={close} className={itemClass}><CreditCard size={16} aria-hidden="true" />Plans & billing</Link>
      <div className="my-1 border-t border-auth-line" />
      <button type="button" className={`${itemClass} w-full`} onClick={async () => { close(); await logout(); navigate('/login'); }}><LogOut size={16} aria-hidden="true" />Sign out</button>
    </nav>
  </details>;
}

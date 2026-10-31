import { useEffect, useRef, useState } from 'react';
import { fetchMyPlan } from '../services/planService';

const KEY = 'clipinsights-pending-activation';
function readPending() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY));
    const age = Date.now() - saved?.createdAt;
    return saved && typeof saved.slug === 'string' && /^[a-z0-9-]{1,30}$/.test(saved.slug) && Number.isFinite(age) && age >= 0 && age < 30 * 60_000 ? saved : null;
  } catch { return null; }
}
export default function usePlanActivation(authRequest, isAuthenticated, onConfirmed) {
  const [pending, setPending] = useState(readPending);
  const [status, setStatus] = useState('idle');
  const confirmed = useRef(onConfirmed);
  confirmed.current = onConfirmed;
  useEffect(() => {
    if (!isAuthenticated) {
      setStatus('idle');
      setPending(null);
      return;
    }
    if (!pending) return;
    let active = true;
    let timer;
    let attempts = 0;
    setStatus('checking');
    const check = async () => {
      let connected = true;
      try {
        const mine = await fetchMyPlan(authRequest);
        if (!active) return;
        if (mine?.plan?.slug === pending.slug) {
          try { sessionStorage.removeItem(KEY); } catch { /* Activation remains confirmed without browser storage. */ }
          setStatus('confirmed');
          setPending(null);
          await confirmed.current();
          return;
        }
      } catch { connected = false; }
      if (!active) return;
      attempts += 1;
      if (attempts >= 10) { setStatus(connected ? 'delayed' : 'error'); return; }
      timer = setTimeout(check, 2000);
    };
    check();
    return () => { active = false; clearTimeout(timer); };
  }, [pending, authRequest, isAuthenticated]);
  const begin = slug => {
    const value = { slug, createdAt: Date.now() };
    try { sessionStorage.setItem(KEY, JSON.stringify(value)); } catch { /* The current page can still track activation. */ }
    setPending(value);
  };
  return { status, pending: Boolean(pending) && isAuthenticated, begin, retry: () => setPending(value => value ? { ...value } : value) };
}

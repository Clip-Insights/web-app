import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchProfile } from '../../services/accountService';
import { fetchMyPlan, formatStorage } from '../../services/planService';

export default function Settings() {
  const { authRequest } = useAuth();
  const [data, setData] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setData(null);
    Promise.allSettled([fetchProfile(authRequest), fetchMyPlan(authRequest)]).then(([profile, plan]) => {
      if (!cancelled) setData({ profile: profile.status === 'fulfilled' ? profile.value : null, plan: plan.status === 'fulfilled' ? plan.value.plan : null });
    });
    return () => { cancelled = true; };
  }, [authRequest, attempt]);
  const actionClass = 'inline-flex min-h-11 items-center gap-2 rounded-lg border border-auth-line px-4 text-sm font-medium text-auth-ink hover:border-auth-accent hover:text-auth-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-accent';
  return <div className="mx-auto max-w-4xl">
    <h1 className="text-2xl font-semibold tracking-tight text-auth-ink sm:text-3xl">Account settings</h1>
    <p className="mt-2 text-sm text-auth-muted">Your account, security, and plan in one place.</p>
    {!data ? <div role="status" aria-label="Loading account settings" className="mt-6 h-64 animate-pulse rounded-xl bg-white motion-reduce:animate-none" /> : <div className="mt-6 space-y-4">
      {(!data.profile || !data.plan) && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-auth-line bg-white p-5"><p className="text-sm text-auth-muted">Some account details couldn’t be loaded.</p><button type="button" onClick={() => setAttempt(value => value + 1)} className={actionClass}>Retry</button></div>}
      <section className="rounded-xl border border-auth-line bg-white p-6" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="text-base font-semibold">Profile</h2>
        <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2"><div><dt className="text-xs text-auth-muted">Name</dt><dd className="mt-1 break-words">{data.profile?.name || 'Unavailable'}</dd></div><div><dt className="text-xs text-auth-muted">Email address</dt><dd className="mt-1 break-words">{data.profile?.email || 'Unavailable'}</dd></div></dl>
      </section>
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-auth-line bg-white p-6" aria-labelledby="security-heading">
        <div><h2 id="security-heading" className="text-base font-semibold">Security</h2><p className="mt-2 text-sm text-auth-muted">Request an email to reset your password.</p></div><Link to="/reset-password" className={actionClass}>Reset password<ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
      <section className="rounded-xl border border-auth-line bg-white p-6" aria-labelledby="plan-heading">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 id="plan-heading" className="text-base font-semibold">Plan and usage</h2><p className="mt-2 text-sm text-auth-muted">{data.plan ? `${data.plan.name} plan` : 'Plan unavailable'}</p></div><Link to="/pricing" className={actionClass}>Plans & billing<ArrowRight size={16} aria-hidden="true" /></Link></div>
        {data.plan && <dl className="mt-5 grid gap-5 border-t border-auth-line pt-5 text-sm sm:grid-cols-3"><div><dt className="text-xs text-auth-muted">Summaries + key points</dt><dd className="mt-1">{data.plan.daily_summaries} / 24 hours</dd></div><div><dt className="text-xs text-auth-muted">Chat messages</dt><dd className="mt-1">{data.plan.daily_chat_messages} / 24 hours</dd></div><div><dt className="text-xs text-auth-muted">Cloud storage</dt><dd className="mt-1">{formatStorage(data.plan.storage_limit_mb)}</dd></div></dl>}
        <Link to="/" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-auth-accent hover:underline">View current usage<ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-auth-muted">{[['Help & support','contact'],['Privacy policy','privacy']].map(([label,path]) => <a key={path} href={`https://clipinsights.org/${path}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded hover:text-auth-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">{label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</div>
    </div>}
  </div>;
}

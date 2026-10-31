import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { readPlanSelection, withPlanSelection } from '../../utils/planSelection';
import AuthLayout from '../../components/Auth/AuthLayout';
import AuthField from '../../components/Auth/AuthField';
import { AuthSubmit, BackToSignIn } from '../../components/Auth/AuthActions';
import Notice from '../../components/Feedback/Notice';
import { resendVerification } from '../../services/accountService';

export default function SignupSuccess() {
  const selection = readPlanSelection(useLocation().search);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending'); setError('');
    try { await resendVerification(email.trim()); setStatus('sent'); }
    catch (failure) { setError(failure.message); setStatus('idle'); }
  };
  return <AuthLayout><h1 className="text-3xl font-bold tracking-tight">Check your inbox.</h1><p className="mb-8 mt-3 text-sm leading-6 text-auth-muted">Open the verification email from Clip Insights to activate your account. Check your spam folder if it hasn’t arrived.</p>
    {status === 'sent' && <Notice tone="success">Another verification email is on its way. Use the latest link in your inbox.</Notice>}
    <details className="mt-6 border-t border-auth-line pt-4"><summary className="cursor-pointer rounded py-2 text-sm font-medium text-auth-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">Need another verification email?</summary><form onSubmit={submit} className="mt-4 space-y-5">{error && <Notice tone="error">{error}</Notice>}<AuthField label="Email address" id="resend-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /><AuthSubmit busy={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Resend verification email'}</AuthSubmit></form></details>
    <BackToSignIn to={withPlanSelection('/login', selection)} />
  </AuthLayout>;
}

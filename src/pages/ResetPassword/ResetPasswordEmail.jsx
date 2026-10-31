import { useState } from 'react';
import AuthLayout from '../../components/Auth/AuthLayout';
import AuthField from '../../components/Auth/AuthField';
import { AuthSubmit, BackToSignIn } from '../../components/Auth/AuthActions';
import Notice from '../../components/Feedback/Notice';
import { requestPasswordReset } from '../../services/accountService';

export default function ResetPasswordEmail() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending'); setError('');
    try { await requestPasswordReset(email.trim()); setStatus('sent'); }
    catch (failure) { setError(failure.status === 400 || failure.status === 404 ? 'We couldn’t send a reset link. Check your email address and try again.' : failure.message); setStatus('idle'); }
  };
  return <AuthLayout>
    <h1 className="text-3xl font-bold tracking-tight">{status === 'sent' ? 'Check your inbox.' : 'Forgot your password?'}</h1>
    <p className="mb-8 mt-3 text-sm leading-6 text-auth-muted">{status === 'sent' ? `We sent a reset link to ${email.trim()}. Open the email to choose a new password.` : 'Enter your account email and we’ll send you a link to reset it.'}</p>
    {status === 'sent' ? <Notice action={<button type="button" onClick={() => setStatus('idle')} className="min-h-11 rounded font-medium text-auth-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">Try another email</button>}>Can’t find it? Check your spam folder. You can also return here to request another link.</Notice> : <form onSubmit={submit} aria-label="Reset password" className="space-y-5">
      {error && <Notice tone="error">{error}</Notice>}
      <fieldset disabled={status === 'sending'} className="space-y-5"><AuthField label="Email address" id="reset-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} /><AuthSubmit busy={status === 'sending'}>{status === 'sending' ? 'Sending link…' : 'Send reset link'}</AuthSubmit></fieldset>
    </form>}
    <BackToSignIn />
  </AuthLayout>;
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthLayout from '../../components/Auth/AuthLayout';
import AuthField from '../../components/Auth/AuthField';
import { AuthSubmit, BackToSignIn } from '../../components/Auth/AuthActions';
import Notice from '../../components/Feedback/Notice';
import { updatePassword } from '../../services/accountService';

export default function ResetPasswordNew() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [invalidLink, setInvalidLink] = useState(false);
  const submit = async event => {
    event.preventDefault();
    if (status === 'saving') return;
    setError('');
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) { setError('Use at least 8 characters, including a letter and a number.'); return; }
    if (password !== confirmation) { setError('Your passwords don’t match. Please check them.'); return; }
    setStatus('saving');
    try { await updatePassword(uid, token, password); setStatus('saved'); }
    catch (failure) { setError(failure.message); setInvalidLink([401, 403, 404, 410].includes(failure.status) || /token|expired|invalid link/i.test(failure.message)); setStatus('idle'); }
  };
  return <AuthLayout>
    <h1 className="text-3xl font-bold tracking-tight">{status === 'saved' ? 'You’re ready to sign in.' : 'Choose a new password.'}</h1>
    <p className="mb-8 mt-3 text-sm leading-6 text-auth-muted">{status === 'saved' ? 'Your password has been updated. Use it the next time you sign in.' : 'Make it unique to your Clip Insights account.'}</p>
    {status === 'saved' ? <Notice tone="success">Password updated successfully.</Notice> : <form onSubmit={submit} aria-label="Choose a new password" className="space-y-5">
      {error && <Notice tone="error" action={invalidLink && <Link to="/reset-password" className="inline-flex min-h-11 items-center rounded font-medium text-auth-accent">Request a new reset link</Link>}>{error}</Notice>}
      <fieldset disabled={status === 'saving'} className="space-y-5"><AuthField label="New password" id="new-password" type="password" autoComplete="new-password" hint="At least 8 characters, including a letter and a number." value={password} onChange={event => setPassword(event.target.value)} /><AuthField label="Confirm password" id="confirm-password" type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} /><AuthSubmit busy={status === 'saving'}>{status === 'saving' ? 'Updating password…' : 'Update password'}</AuthSubmit></fieldset>
    </form>}
    <BackToSignIn />
  </AuthLayout>;
}

import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { pendingPlanSelection, readPlanSelection, withPlanSelection } from '../../utils/planSelection';
import { verifyEmail, resendVerification } from '../../services/accountService';
import AuthLayout from '../../components/Auth/AuthLayout';
import AuthField from '../../components/Auth/AuthField';
import { AuthSubmit, BackToSignIn } from '../../components/Auth/AuthActions';
import Notice from '../../components/Feedback/Notice';

export default function VerifyEmail() {
  const { uid, token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selection] = useState(() => readPlanSelection(location.search) ?? pendingPlanSelection());
  const loginUrl = withPlanSelection('/login', selection);
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let timer;
    setStatus('verifying'); setError('');
    verifyEmail(uid, token, controller.signal).then(() => {
      if (controller.signal.aborted) return;
      setStatus('verified');
      timer = setTimeout(() => navigate(loginUrl, { replace: true }), 3000);
    }).catch(failure => {
      if (controller.signal.aborted) return;
      setStatus([400, 401, 403, 404, 410].includes(failure.status) ? 'invalid' : 'error');
      setError(failure.message);
    });
    return () => { controller.abort(); clearTimeout(timer); };
  }, [uid, token, loginUrl, navigate, attempt]);
  const resend = async event => {
    event.preventDefault();
    if (resendStatus === 'sending') return;
    setResendStatus('sending'); setError('');
    try { await resendVerification(email.trim()); setResendStatus('sent'); }
    catch (failure) { setError(failure.message); setResendStatus('idle'); }
  };
  return <AuthLayout>
    <h1 className="text-3xl font-bold tracking-tight">{status === 'verifying' ? 'Verifying your email.' : status === 'verified' ? 'Your email is verified.' : status === 'invalid' ? 'Let’s get you a fresh link.' : 'We couldn’t verify your email.'}</h1>
    <p className="mb-8 mt-3 text-sm leading-6 text-auth-muted">{status === 'verified' ? 'Your account is ready. Taking you to sign in…' : status === 'invalid' ? 'This link may have expired or already been used. Try signing in, or request another verification email.' : 'One small step to keep your account connected to you.'}</p>
    {status === 'verifying' && <div role="status" className="flex items-center gap-3 text-sm text-auth-muted"><LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />Checking your verification link…</div>}
    {status === 'verified' && <Link to={loginUrl} className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-auth-accent px-4 text-sm font-semibold text-white hover:bg-auth-hover">Continue to sign in</Link>}
    {(status === 'invalid' || status === 'error') && <div className="space-y-5">{error && <Notice tone="error">{error}</Notice>}{status === 'error' && <button type="button" onClick={() => setAttempt(value => value + 1)} className="min-h-11 rounded-lg border border-auth-line px-4 text-sm font-medium">Try verification again</button>}{resendStatus === 'sent' && <Notice tone="success">Verification email sent. Use the latest link in your inbox.</Notice>}<form onSubmit={resend} className="space-y-5"><AuthField label="Email address" id="verification-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /><AuthSubmit busy={resendStatus === 'sending'}>{resendStatus === 'sending' ? 'Sending…' : 'Resend verification email'}</AuthSubmit></form></div>}
    {status !== 'verified' && <BackToSignIn to={loginUrl} />}
  </AuthLayout>;
}

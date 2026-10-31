import { readPlanSelection, withPlanSelection, planDestination, clearPendingPlanSelection } from "../../utils/planSelection";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../services/Utils";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthField from "../../components/Auth/AuthField";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { getApiUrl } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const selection = readPlanSelection(useLocation().search);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth(); // Access login function from context
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      handleError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const url = getApiUrl("account/login/");
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();

      if (response.ok) {
        // AuthContext handles token encryption.
        login({ access: data.token.access, refresh: data.token.refresh });

        handleSuccess("Login successful!");
        clearPendingPlanSelection();
        navigate(planDestination(selection));
      } else {
        const errorMessage = data.errors?.non_field_errors?.[0] ||
                           data.message ||
                           "An unknown error occurred. Please try again.";
        handleError(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      handleError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const url = getApiUrl("account/google-login/");
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ token: credentialResponse.credential }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        login({ access: data.token.access, refresh: data.token.refresh });
        handleSuccess("Google login successful!");
        clearPendingPlanSelection();
        navigate(planDestination(selection));
      } else {
        handleError(data.error || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      handleError("Google login failed. Please try again.");
    }
  };

  if (isAuthenticated) return <Navigate to={planDestination(selection)} replace />;

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back.</h1>
        <p className="mt-3 text-sm leading-6 text-auth-muted">Your notes, your ideas, your next study session.</p>
      </div>
      {selection && <p className="mb-6 rounded-lg border border-auth-line bg-auth-panel p-4 text-sm text-auth-muted">Your selected plan and {selection.billing} billing will be kept while you sign in. You can review the total before payment.</p>}
      <form onSubmit={handleLogin} aria-label="Sign in">
        <fieldset disabled={loading} className="space-y-5">
          <AuthField label="Email address" id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <AuthField label="Password" id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex justify-end">
            <Link to="/reset-password" className="rounded text-sm text-auth-muted underline-offset-4 hover:text-auth-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} aria-busy={loading} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-auth-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-auth-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-auth-accent disabled:cursor-wait disabled:opacity-60">
            {loading ? <><LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />Signing in…</> : <>Sign in<ArrowRight size={18} aria-hidden="true" /></>}
          </button>
        </fieldset>
      </form>
      <div className="my-6 flex items-center gap-4 text-xs text-auth-muted"><span className="h-px flex-1 bg-auth-line" /><span>or continue with</span><span className="h-px flex-1 bg-auth-line" /></div>
      <div className="flex min-h-11 justify-center">
        <GoogleLogin size="large" shape="rectangular" text="continue_with" width="256" onSuccess={handleGoogleLogin} onError={() => handleError("Google login failed")} />
      </div>
      <p className="mt-8 text-center text-sm text-auth-muted">New to Clip Insights? <Link to={withPlanSelection("/signup", selection)} className="rounded font-semibold text-auth-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">Create an account</Link></p>
      <ToastContainer />
    </AuthLayout>
  );
};

export default Login;

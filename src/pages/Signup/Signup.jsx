import { readPlanSelection, withPlanSelection, planDestination, clearPendingPlanSelection, rememberPlanSelection } from "../../utils/planSelection";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../services/Utils";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthField from "../../components/Auth/AuthField";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { getApiUrl } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

const Signup = () => {
  const selection = readPlanSelection(useLocation().search);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation checks
    if (!email || !password || !confirmPassword || !fullName) {
      setLoading(false);
      return handleError("Please fill in all fields");
    }
    const passwordRegex = /^(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setLoading(false);
      return handleError(
        "Password must be at least 8 characters long and include a number"
      );
    }
    if (password !== confirmPassword) {
      setLoading(false);
      return handleError("Passwords do not match");
    }

    // Password length and character validations

    try {
      const url = getApiUrl("account/signup/");
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          email,
          name: fullName,
          password,
        }),
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
        rememberPlanSelection(selection);
        navigate(withPlanSelection("/signup-success", selection));
      } else {
        const errorMessage =
          data.errors?.email?.[0] ||
          data.message ||
          "An unknown error occurred. Please try again.";
        handleError(errorMessage);
      }
    } catch (error) {
      console.error("Signup error:", error);
      handleError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
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
        handleSuccess("Signed up with Google!");
        clearPendingPlanSelection();
        navigate(planDestination(selection));
      } else {
        handleError(data.error || "Google signup failed");
      }
    } catch (error) {
      console.error("Google signup error:", error);
      handleError("Google signup failed. Please try again.");
    }
  };

  if (isAuthenticated) return <Navigate to={planDestination(selection)} replace />;

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Make room for your ideas.</h1>
        <p className="mt-3 text-sm leading-6 text-auth-muted">Create your account. Keep your learning close.</p>
      </div>
      {selection && <p className="mb-6 rounded-lg border border-auth-line bg-auth-panel p-4 text-sm text-auth-muted">Your selected plan and {selection.billing} billing will be kept while you sign in. You can review the total before payment.</p>}
      <form onSubmit={handleSignup} aria-label="Create account">
        <fieldset disabled={loading} className="space-y-4">
          <AuthField label="Full name" id="fullName" autoComplete="name" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <AuthField label="Email address" id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <AuthField label="Password" id="password" type="password" autoComplete="new-password" placeholder="Create a password" hint="Use at least 8 characters, including a number." value={password} onChange={(e) => setPassword(e.target.value)} />
          <AuthField label="Confirm password" id="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <button type="submit" disabled={loading} aria-busy={loading} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-auth-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-auth-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-auth-accent disabled:cursor-wait disabled:opacity-60">
            {loading ? <><LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />Creating account…</> : <>Create account<ArrowRight size={18} aria-hidden="true" /></>}
          </button>
        </fieldset>
      </form>
      <p className="mt-4 text-xs leading-5 text-auth-muted">By creating an account, you agree to our <a href="https://clipinsights.org/terms" className="rounded underline underline-offset-2 hover:text-auth-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">Terms</a> and <a href="https://clipinsights.org/privacy" className="rounded underline underline-offset-2 hover:text-auth-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">Privacy Policy</a>.</p>
      <div className="my-6 flex items-center gap-4 text-xs text-auth-muted"><span className="h-px flex-1 bg-auth-line" /><span>or continue with</span><span className="h-px flex-1 bg-auth-line" /></div>
      <div className="flex min-h-11 justify-center">
        <GoogleLogin size="large" shape="rectangular" text="signup_with" width="256" onSuccess={handleGoogleSignup} onError={() => handleError("Google signup failed")} />
      </div>
      <p className="mt-6 text-center text-sm text-auth-muted">Already have an account? <Link to={withPlanSelection("/login", selection)} className="rounded font-semibold text-auth-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">Sign in</Link></p>
      <ToastContainer />
    </AuthLayout>
  );
};

export default Signup;

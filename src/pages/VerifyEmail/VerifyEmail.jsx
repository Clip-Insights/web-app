import { pendingPlanSelection, readPlanSelection, withPlanSelection } from "../../utils/planSelection";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../services/Utils";
import signup_png from "/images/signup.png";
import { getApiUrl } from "../../services/apiService";

const VerifyEmail = () => {
  const { uid, token } = useParams();
  const location = useLocation();
  const [selection] = useState(() => readPlanSelection(location.search) ?? pendingPlanSelection());
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  // Verify email on component mount
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const url = getApiUrl(`account/verify-email/${uid}/${token}/`);
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(data.msg || "Email verified successfully!");
          setTimeout(() => navigate(withPlanSelection("/login", selection)), 3000); // Redirect to login
        } else {
          setError(data.error || "Failed to verify email.");
        }
      } catch (error) {
        console.error("Error:", error);
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [uid, token, navigate, selection]);

  // Handle resend verification email
  const handleResendEmail = async (e) => {
    e.preventDefault();
    setResendLoading(true);
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      setResendLoading(false);
      return;
    }

    try {
      const url = getApiUrl("account/resend-verification/");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        handleSuccess("Verification email resent. Please check your email.");
      } else {
        handleError(data.errors?.non_field_errors?.[0] || "Failed to resend verification email.");
      }
    } catch (error) {
      console.error("Error:", error);
      handleError("An error occurred. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full md:flex-row justify-around items-center min-h-92vh p-8">
      {/* Image Section */}
      <div className="w-full max-w-md h-96 flex justify-center items-center mr-8 mb-8 md:mb-0">
        <img
          src={signup_png}
          alt="Email Verification Illustration"
          className="rounded-lg max-w-full h-full object-cover"
        />
      </div>

      {/* Verification Section */}
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Verify Email</h2>

        {loading && (
          <p className="text-gray-600">Verifying your email, please wait...</p>
        )}

        {success && (
          <div>
            <p className="text-green-500 mb-4">{success}</p>
            <p className="text-gray-600">
              Redirecting to login page in a few seconds...
            </p>
          </div>
        )}

        {error && (
          <div>
            <p className="text-red-500 mb-4">{error}</p>
            <form onSubmit={handleResendEmail}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Enter your email to resend verification
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbb3] focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={resendLoading}
                className="w-full bg-customPrimary hover:bg-customPrimary text-white py-3 rounded-md text-lg focus:outline-none transition duration-300"
              >
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </button>
            </form>
          </div>
        )}

        <ToastContainer />
      </div>
    </div>
  );
};

export default VerifyEmail;
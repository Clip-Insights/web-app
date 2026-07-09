import React, { useState } from "react";
import signup_png from "/images/signup.png";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../services/Utils";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation checks
    if (!email || !password || !confirmPassword || !fullName) {
      return handleError("Please fill in all fields");
    }
    const passwordRegex = /^(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setLoading(false);
      return handleError(
        "Password must be at least 8 characters long and contain both letters and numbers"
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
        // handleSuccess(data.msg || "Signup successful!");
        setTimeout(() => {
          navigate("/signup-success");
        }, 1500);
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
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        handleError(data.error || "Google signup failed");
      }
    } catch (error) {
      console.error("Google signup error:", error);
      handleError("Google signup failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col w-full md:flex-row justify-around items-center min-h-92vh p-8">
      {/* Image Section */}
      <div className="hidden md:flex w-full max-w-md h-96 justify-center items-center">
        <img
          src={signup_png}
          alt="Signup Illustration"
          className="rounded-lg max-w-full h-full object-cover"
        />
      </div>

      {/* Signup Form */}
      <div className="w-full max-w-md mr-8 mb-8 md:mb-0">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Register for Clip Insights!
        </h2>
        <form onSubmit={handleSignup}>
          {/* Full Name Input */}
          <div className="mb-6">
            <label htmlFor="fullName" className="block text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbb3] focus:border-transparent"
            />
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbb3] focus:border-transparent"
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbb3] focus:border-transparent"
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbb3] focus:border-transparent"
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="w-full bg-customPrimary hover:bg-customPrimaryHover text-white py-3 rounded-md text-lg focus:outline-none transition duration-300"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <ToastContainer />

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="flex justify-center">
          <GoogleLogin
            text="signup_with"
            onSuccess={handleGoogleSignup}
            onError={() => {
              handleError("Google signup failed");
            }}
          />
        </div>

        {/* Login Link */}
        <p className="mt-6 text-gray-700 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-customPrimary hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;

import React, { useState } from "react";
import login_png from "/images/login.png";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../services/Utils";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Access login function from context
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
        // AuthContext encrypts once on store — don't encrypt here.
        login({ access: data.token.access, refresh: data.token.refresh });
        
        handleSuccess("Login successful!");
        setTimeout(() => {
          navigate('/');
        }, 1500);
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
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        handleError(data.error || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      handleError("Google login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col w-full lg:flex-row justify-around items-center min-h-92vh p-4 md:p-8">
      {/* Login Form */}
      <div className="w-full max-w-md lg:mr-8 mb-8 lg:mb-0">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">
          Welcome to Clip Insights!
        </h2>
        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="mb-4 md:mb-6">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbb3] focus:border-transparent"
            />
          </div>

          {/* Password Input */}
          <div className="mb-4 md:mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbb3] focus:border-transparent"
            />
            <a
              href="/reset-password"
              className="text-sm text-gray-500 mt-2 inline-block hover:text-customPrimary"
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-customPrimary hover:bg-customPrimaryHover text-white py-2 md:py-3 rounded-md text-base md:text-lg focus:outline-none transition duration-300"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>
        <ToastContainer />

        {/* Sign up Link */}
        <p className="mt-4 md:mt-6 text-gray-700 text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="text-customPrimary hover:underline">
            Sign Up
          </a>
        </p>

        <div className="w-full max-w-md">
          <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                handleError("Google login failed");
              }}
            />
          </div>
        </div>
      </div>

      {/* Image Section - Hidden on mobile */}
      <div className="hidden md:flex w-full max-w-md h-96 justify-center items-center">
        <img
          src={login_png}
          alt="Login Illustration"
          className="rounded-lg max-w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;
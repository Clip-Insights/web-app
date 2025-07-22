import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import signup_png from "/images/signup.png";
import { getApiUrl } from "../../services/apiService";

const ResetPasswordNew = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation checks
    if (!newPassword || !confirmPassword) {
      return handleError("Please fill in all fields");
    }

    const passwordRegex = /^(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setLoading(false);
      return handleError(
        "Password must be at least 8 characters long and contain both letters and numbers"
      );
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const url = getApiUrl(`account/reset-password/${uid}/${token}/`);
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          password: newPassword,
          password2: confirmPassword,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Password updated successfully.");
        navigate("/login");
      } else {
        setError(
          data.errors?.non_field_errors?.[0] || "Failed to update password."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full md:flex-row justify-around items-center min-h-92vh p-8">
      {/* Image Section */}
      <div className="w-full max-w-md h-96 flex justify-center items-center mr-8 mb-8 md:mb-0">
        <img
          src={signup_png}
          alt="Reset Password Illustration"
          className="rounded-lg max-w-full h-full object-cover"
        />
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Set New Password
        </h2>
        <form onSubmit={handleSubmit}>
          {/* New Password Input */}
          <div className="mb-6">
            <label htmlFor="newPassword" className="block text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f4cbb3] focus:border-transparent"
              required
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
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-customPrimary  hover:bg-customPrimary text-white py-3 rounded-md text-lg focus:outline-none transition duration-300"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {/* Success Message */}
        {success && <p className="text-green-500 mt-4">{success}</p>}
      </div>
    </div>
  );
};

export default ResetPasswordNew;

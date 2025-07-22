import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { decryptToken, encryptToken } from "../services/apiService";
import { getApiUrl } from "../services/apiService";
// Create the Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for tokens on app load
  useEffect(() => {
    const accessToken = decryptToken(localStorage.getItem("access"));
    const refreshToken = decryptToken(localStorage.getItem("refresh"));

    if (accessToken && refreshToken) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  // Update login method to properly set authentication
  const login = (tokens) => {
    if (tokens?.access && tokens?.refresh) {
      localStorage.setItem("access", encryptToken(tokens.access));
      localStorage.setItem("refresh", encryptToken(tokens.refresh));
      setIsAuthenticated(true);
    }
  };

  // Update logout method to properly clear authentication
  const logout = async () => {
    try {
      const url = getApiUrl("account/logout/");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${decryptToken(localStorage.getItem("access"))}`
        },
        body: JSON.stringify({
          refresh: decryptToken(localStorage.getItem("refresh"))
        })
      });

      if (response.ok) {
        // Clear all tokens from local storage
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setIsAuthenticated(false);
        handleSuccess("Logged out successfully!");
      } else {
        handleError("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Clear tokens even if the server request fails
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      setIsAuthenticated(false);
      handleError("An error occurred during logout");
    }
  };

  // New method to refresh tokens
  const refreshTokens = useCallback(async () => {
    try {
      const decryptedRefreshToken = decryptToken(localStorage.getItem("refresh"));
      console.log(decryptedRefreshToken);
      
      const refreshToken = decryptedRefreshToken;
      
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // Replace with your actual refresh token endpoint
      const response = await axios.post(getApiUrl("account/refresh-token/"), { 
        refresh: refreshToken 
      });

      // Assuming the response contains new access and refresh tokens
      const { access: newAccessToken} = response.data;

      // Update tokens in local storage
      localStorage.setItem("access", encryptToken(newAccessToken));
      // localStorage.setItem("refresh", encryptToken(newRefreshToken));

      return newAccessToken;
    } catch (error) {
      // If refresh fails, logout the user
      logout();
      return null;
    }
  }, []);

  // Method to make authenticated requests with automatic token refresh
  const authRequest = useCallback(async (requestConfig) => {
    try {
      // Get current access token
      const accessToken = decryptToken(localStorage.getItem("access"));

      // Create axios instance with the current access token
      const instance = axios.create({
        ...requestConfig,
        headers: {
          ...requestConfig.headers,
          Authorization: `Bearer ${accessToken}`
        }
      });

      // Make the request
      const response = await instance(requestConfig);
      return response;
    } catch (error) {
      // If the request fails due to an unauthorized error (likely token expiration)
      if (error.response && error.response.status === 401) {
        // Try to refresh the token
        const newAccessToken = await refreshTokens();

        if (newAccessToken) {
          // Retry the original request with the new token
          try {
            const retryConfig = {
              ...requestConfig,
              headers: {
                ...requestConfig.headers,
                Authorization: `Bearer ${newAccessToken}`
              }
            };
            const retryResponse = await axios(retryConfig);
            return retryResponse.data;
          } catch (retryError) {
            // If retry fails, logout
            logout();
            throw retryError;
          }
        }
      }

      // For other errors, rethrow
      throw error;
    }
  }, [refreshTokens]);

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isLoading, 
        login, 
        logout, 
        refreshTokens, 
        authRequest 
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

// Custom Hook to Access Auth Context
export function useAuth() {
  return useContext(AuthContext);
}
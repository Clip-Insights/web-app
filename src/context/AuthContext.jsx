import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import SessionLoading from "../components/Loading/SessionLoading";
import PropTypes from "prop-types";
import { decryptToken, encryptToken, getApiUrl } from "../services/apiService";
import { handleError, handleSuccess } from "../services/Utils";

// Create the Auth Context
const AuthContext = createContext();

// Refresh slightly before the JWT actually expires so a token that would lapse
// mid-request is renewed up front instead of failing with a 401. Matters now
// that access tokens only live 5 minutes.
const EXPIRY_BUFFER_MS = 30_000;

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return !Number.isFinite(payload.exp) || Date.now() >= payload.exp * 1000 - EXPIRY_BUFFER_MS;
  } catch {
    return true;
  }
}

// Auth Provider Component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Single-flight refresh: concurrent 401s share one refresh call instead of
  // racing several (SimpleJWT would accept them all, but it's wasted round-trips).
  const refreshInFlight = useRef(null);

  // On app load the session is alive as long as the *refresh* token is valid —
  // the access token being expired is normal and fixed on the first request.
  useEffect(() => {
    const refreshToken = decryptToken(localStorage.getItem("refresh"));
    setIsAuthenticated(!isTokenExpired(refreshToken));
    setSessionExpired(Boolean(refreshToken) && isTokenExpired(refreshToken));
    setIsLoading(false);
  }, []);

  const login = (tokens) => {
    if (tokens?.access && tokens?.refresh) {
      localStorage.setItem("access", encryptToken(tokens.access));
      localStorage.setItem("refresh", encryptToken(tokens.refresh));
      setIsAuthenticated(true);
      setSessionExpired(false);
    }
  };

  const clearSession = useCallback((expired = false) => {
    setSessionExpired(expired);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthenticated(false);
    try { sessionStorage.removeItem('clipinsights-pending-activation'); } catch { /* Local sign-out still completes. */ }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = decryptToken(localStorage.getItem("refresh"));
    const accessToken = decryptToken(localStorage.getItem("access"));
    // The session ends locally no matter what the server says.
    clearSession();
    try {
      await axios.post(
        getApiUrl("account/logout/"),
        { refresh: refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      handleSuccess("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      handleError("You have been logged out locally.");
    }
  }, [clearSession]);

  // Exchange the refresh token for a new access token. Returns the new access
  // token, or null (and ends the session) when the refresh token is unusable.
  const refreshTokens = useCallback(() => {
    if (refreshInFlight.current) return refreshInFlight.current;

    refreshInFlight.current = Promise.resolve().then(async () => {
      try {
        const refreshToken = decryptToken(localStorage.getItem("refresh"));
        if (!refreshToken || isTokenExpired(refreshToken)) {
          clearSession(true);
          return null;
        }
        const response = await axios.post(getApiUrl("account/refresh-token/"), {
          refresh: refreshToken,
        });
        const { access } = response.data;
        if (!access) throw new Error('The session could not be refreshed. Please try again.');
        localStorage.setItem("access", encryptToken(access));
        return access;
      } catch (error) {
        if ([400, 401, 403].includes(error.response?.status)) {
          clearSession(true);
          return null;
        }
        throw error;
      } finally {
        refreshInFlight.current = null;
      }
    });

    return refreshInFlight.current;
  }, [clearSession]);

  // A valid access token, refreshing proactively when it is (nearly) expired.
  const ensureAccessToken = useCallback(async () => {
    const accessToken = decryptToken(localStorage.getItem("access"));
    if (!isTokenExpired(accessToken)) return accessToken;
    return refreshTokens();
  }, [refreshTokens]);

  // Authenticated request with the standard token lifecycle:
  // ensure a fresh token -> request -> on 401 refresh once and retry.
  // Always resolves to a full axios response (never a bare payload).
  const authRequest = useCallback(
    async (requestConfig) => {
      const accessToken = await ensureAccessToken();
      if (!accessToken) {
        const error = new Error("Your session has expired. Please log in again.");
        error.isAuthError = true;
        throw error;
      }

      const send = (token) =>
        axios({
          ...requestConfig,
          headers: { ...requestConfig.headers, Authorization: `Bearer ${token}` },
        });

      try {
        return await send(accessToken);
      } catch (error) {
        if (error.response?.status !== 401) throw error;
        const freshToken = await refreshTokens();
        if (!freshToken) throw error;
        try { return await send(freshToken); }
        catch (retryError) {
          if (retryError.response?.status === 401) clearSession(true);
          throw retryError;
        }
      }
    },
    [ensureAccessToken, refreshTokens, clearSession]
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        sessionExpired,
        login,
        logout,
        refreshTokens,
        authRequest,
      }}
    >
      {isLoading ? <SessionLoading /> : children}
    </AuthContext.Provider>
  );
}

// Custom Hook to Access Auth Context
export function useAuth() {
  return useContext(AuthContext);
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

import { getApiUrl, accountRequest } from './apiService';

export async function fetchProfile(authRequest) {
  const response = await authRequest({ method: 'get', url: getApiUrl('account/profile/') });
  return response.data;
}

export const requestPasswordReset = email => accountRequest('reset-password/', { email });
export const updatePassword = (uid, token, password) => accountRequest(`reset-password/${encodeURIComponent(uid)}/${encodeURIComponent(token)}/`, { password, password2: password });
export const verifyEmail = (uid, token, signal) => accountRequest(`verify-email/${encodeURIComponent(uid)}/${encodeURIComponent(token)}/`, undefined, signal);
export const resendVerification = email => accountRequest('resend-verification/', { email });

import { getApiUrl } from './apiService';

export async function fetchProfile(authRequest) {
  const response = await authRequest({ method: 'get', url: getApiUrl('account/profile/') });
  return response.data;
}

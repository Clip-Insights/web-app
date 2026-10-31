import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './AuthContext';
import { encryptToken } from '../services/apiService';
vi.mock('axios', () => ({ default: Object.assign(vi.fn(), { post: vi.fn() }) }));
function Probe() {
  const { isAuthenticated, authRequest, sessionExpired } = useAuth();
  const [message, setMessage] = useState('');
  return <><p>{isAuthenticated ? 'Signed in' : sessionExpired ? 'Session expired' : 'Signed out'}</p><button onClick={async () => { try { await authRequest({ url: '/example' }); setMessage('Loaded'); } catch { setMessage('Retry available'); } }}>Load</button><p>{message}</p></>;
}
const token = seconds => `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000) + seconds }))}.signature`;
beforeEach(() => { vi.resetAllMocks(); localStorage.clear(); sessionStorage.clear(); localStorage.setItem('refresh', encryptToken(token(3600))); localStorage.setItem('access', encryptToken(token(-60))); });
describe('session recovery', () => {
  it('preserves the session after a network failure and allows a subsequent refresh', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce({data:{access:token(300)}});
    axios.mockResolvedValue({data:{ok:true}});
    render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(await screen.findByRole('button',{name:'Load'}));
    await screen.findByText('Retry available');
    expect(screen.getByText('Signed in')).toBeTruthy();
    expect(localStorage.getItem('refresh')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'Load'}));
    await screen.findByText('Loaded');
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
  it('ends an invalid session with an explicit expiration reason', async () => {
    axios.post.mockRejectedValue({response:{status:401}});
    render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(await screen.findByRole('button',{name:'Load'}));
    await screen.findByText('Session expired');
    expect(localStorage.getItem('refresh')).toBeNull();
  });
  it('does not treat a temporary server failure as invalid credentials', async () => {
    axios.post.mockRejectedValue({response:{status:503}});
    render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(await screen.findByRole('button',{name:'Load'}));
    await waitFor(() => expect(screen.getByText('Retry available')).toBeTruthy());
    expect(screen.getByText('Signed in')).toBeTruthy();
  });
});

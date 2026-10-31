import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from './Settings';
import { fetchProfile } from '../../services/accountService';
import { fetchMyPlan } from '../../services/planService';
vi.mock('../../context/AuthContext', () => ({useAuth: () => ({authRequest: request})}));
const request = vi.fn();
vi.mock('../../services/accountService', () => ({fetchProfile: vi.fn()}));
vi.mock('../../services/planService', () => ({fetchMyPlan: vi.fn(),formatStorage: value => `${value} MB`}));
beforeEach(() => {vi.resetAllMocks();fetchMyPlan.mockResolvedValue({plan:{name:'Free',daily_summaries:5,daily_chat_messages:20,storage_limit_mb:50}});});
describe('account settings', () => {
 it('shows profile and allowances with a link to the existing password-reset flow', async () => {
  fetchProfile.mockResolvedValue({name:'Zubair',email:'test@example.com'});
  render(<MemoryRouter><Settings /></MemoryRouter>);
  expect(await screen.findByText('test@example.com')).toBeTruthy();
  expect(screen.getByText('20 / 24 hours')).toBeTruthy();
  expect(screen.getByRole('link',{name:'Reset password'}).getAttribute('href')).toBe('/reset-password');
  expect(screen.queryByRole('textbox')).toBeNull();
 });
 it('reveals the loaded profile while the plan is still loading', async () => {
  let finish;
  fetchProfile.mockResolvedValue({name:'Zubair',email:'test@example.com'});
  fetchMyPlan.mockReturnValue(new Promise(resolve => { finish = resolve; }));
  render(<MemoryRouter><Settings /></MemoryRouter>);
  expect(await screen.findByText('test@example.com')).toBeTruthy();
  expect(screen.getByRole('status',{name:'Loading account plan'})).toBeTruthy();
  expect(screen.queryByRole('status',{name:'Loading profile'})).toBeNull();
  await act(async () => finish({plan:{name:'Free',daily_summaries:5,daily_chat_messages:20,storage_limit_mb:50}}));
  expect(screen.queryByRole('status',{name:'Loading account plan'})).toBeNull();
 });
 it('keeps available plan details when profile fails and supports retry', async () => {
  fetchProfile.mockRejectedValueOnce(new Error('offline')).mockResolvedValue({name:'Zubair',email:'test@example.com'});
  render(<MemoryRouter><Settings /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.getByText('Free plan')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Retry'}));
  expect(await screen.findByText('test@example.com')).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
 });
});

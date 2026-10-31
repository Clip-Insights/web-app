import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Pricing from './Pricing';
import { fetchPlans } from '../../services/planService';
import { fetchBillingCatalog } from '../../services/billingService';
vi.mock('../../context/AuthContext', () => ({useAuth: () => auth}));
const auth = {isAuthenticated:false,authRequest:vi.fn()};
vi.mock('../../services/planService', () => ({fetchPlans:vi.fn(),fetchMyPlan:vi.fn(),formatStorage:value=>`${value} MB`}));
vi.mock('../../services/billingService', () => ({fetchBillingCatalog:vi.fn(),fetchSubscription:vi.fn(),createCheckout:vi.fn(),cancelSubscription:vi.fn()}));
const plan = {slug:'pro',name:'Pro',description:'For regular learning.',monthly_price_usd:10,daily_summaries:25,daily_chat_messages:100,transcript_token_budget:16000,storage_limit_mb:1024,max_file_size_mb:25,max_note_chars:5000,max_notes_per_video:300,max_screenshots_per_video:100};
beforeEach(() => { vi.resetAllMocks();fetchPlans.mockResolvedValue([plan]);fetchBillingCatalog.mockResolvedValue([]); });
describe('pricing catalogue', () => {
 it('calculates savings from the catalogue and requires a price ID before checkout', async () => {
  fetchBillingCatalog.mockResolvedValue([{plan_slug:'pro',annual_price_usd:90,paddle_price_id_monthly:'pri_month'}]);
  render(<MemoryRouter><Pricing /></MemoryRouter>);
  expect(await screen.findByRole('button',{name:'Upgrade to Pro'})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Annual billing'}));
  expect(screen.getByText(/Save 25%/)).toBeTruthy();
  expect(screen.getByRole('button',{name:'Coming soon'}).disabled).toBe(true);
  expect(screen.queryByText(/2 months free/)).toBeNull();
 });
 it('keeps purchase actions unavailable until billing metadata finishes loading', async () => {
  let finish;
  fetchBillingCatalog.mockReturnValue(new Promise(resolve => {finish = resolve;}));
  render(<MemoryRouter><Pricing /></MemoryRouter>);
  expect(await screen.findByText('For regular learning.')).toBeTruthy();
  expect(screen.getByRole('status',{name:'Loading Pro plan options'})).toBeTruthy();
  expect(screen.queryByRole('button',{name:'Coming soon'})).toBeNull();
  expect(screen.queryByRole('button',{name:'Upgrade to Pro'})).toBeNull();
  await act(async () => finish([{plan_slug:'pro',annual_price_usd:90,paddle_price_id_monthly:'pri_month'}]));
  expect(screen.getByRole('button',{name:'Upgrade to Pro'})).toBeTruthy();
 });
 it('shows a recoverable error rather than invented prices when plans fail', async () => {
  fetchPlans.mockRejectedValue(new Error('offline'));
  const log=vi.spyOn(console,'error').mockImplementation(()=>{});
  render(<MemoryRouter><Pricing /></MemoryRouter>);
  expect(await screen.findByRole('button',{name:'Retry'})).toBeTruthy();
  expect(screen.queryByText('$10')).toBeNull();log.mockRestore();
 });
});

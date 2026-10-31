import { ToastContainer } from 'react-toastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render as rtlRender, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Pricing from './Pricing';
import { fetchPlans, fetchMyPlan } from '../../services/planService';
import { createCheckout, fetchBillingCatalog, fetchSubscription } from '../../services/billingService';
import { openCheckout } from '../../services/paddle';
vi.mock('../../context/AuthContext', () => ({useAuth: () => auth}));
const render = ui => rtlRender(<>{ui}<ToastContainer /></>);
const auth = {isAuthenticated:false,authRequest:vi.fn()};
vi.mock('../../services/planService', () => ({fetchPlans:vi.fn(),fetchMyPlan:vi.fn(),formatStorage:value=>`${value} MB`}));
vi.mock('../../services/billingService', () => ({fetchBillingCatalog:vi.fn(),fetchSubscription:vi.fn(),createCheckout:vi.fn(),cancelSubscription:vi.fn()}));
vi.mock('../../services/paddle', () => ({ openCheckout: vi.fn() }));
const plan = {slug:'pro',name:'Pro',description:'For regular learning.',monthly_price_usd:10,daily_summaries:25,daily_chat_messages:100,transcript_token_budget:16000,storage_limit_mb:1024,max_file_size_mb:25,max_note_chars:5000,max_notes_per_video:300,max_screenshots_per_video:100};
beforeEach(() => { vi.resetAllMocks();auth.isAuthenticated=false;fetchPlans.mockResolvedValue([plan]);fetchBillingCatalog.mockResolvedValue([]); });

function Destination() { return <p>{useLocation().pathname + useLocation().search}</p>; }
describe('pricing catalogue', () => {
 it('keeps a selected annual plan through sign-in without opening checkout', async () => {
  fetchBillingCatalog.mockResolvedValue([{plan_slug:'pro',annual_price_usd:90,paddle_price_id_monthly:'pri_month',paddle_price_id_annual:'pri_year'}]);
  render(<MemoryRouter initialEntries={['/pricing?plan=pro&billing=annual']}><Routes><Route path="/pricing" element={<Pricing/>}/><Route path="/login" element={<Destination/>}/></Routes></MemoryRouter>);
  expect(await screen.findByRole('heading',{name:'Your Pro plan'})).toBeTruthy();
  expect(screen.getByText(/Billed \$90 per year/)).toBeTruthy();
  expect(createCheckout).not.toHaveBeenCalled();
  fireEvent.click(await screen.findByRole('button',{name:'Sign in to continue'}));
  expect(await screen.findByText('/login?plan=pro&billing=annual')).toBeTruthy();
 });
 it('opens only the chosen plan and cycle after an explicit authenticated confirmation', async () => {
  auth.isAuthenticated=true;
  fetchMyPlan.mockResolvedValue({plan:{slug:'free'}});fetchSubscription.mockResolvedValue(null);
  fetchBillingCatalog.mockResolvedValue([{plan_slug:'pro',annual_price_usd:90,paddle_price_id_annual:'pri_year'}]);
  createCheckout.mockResolvedValue({price_id:'pri_year'});openCheckout.mockResolvedValue();
  render(<MemoryRouter initialEntries={['/pricing?plan=pro&billing=annual']}><Pricing/></MemoryRouter>);
  const confirm=await screen.findByRole('button',{name:'Continue to checkout'});
  expect(createCheckout).not.toHaveBeenCalled();
  fireEvent.click(confirm);
  expect(await vi.waitFor(()=>createCheckout.mock.calls.length)).toBe(1);
  expect(createCheckout).toHaveBeenCalledWith(auth.authRequest,'pro','annual');
  expect(openCheckout).toHaveBeenCalledWith({price_id:'pri_year'},expect.any(Object));
 });
 it('shows checkout failures and allows retry while retaining the selected plan', async () => {
  auth.isAuthenticated=true;
  fetchMyPlan.mockResolvedValue({plan:{slug:'free'}});fetchSubscription.mockResolvedValue(null);
  fetchBillingCatalog.mockResolvedValue([{plan_slug:'pro',annual_price_usd:90,paddle_price_id_annual:'pri_year'}]);
  createCheckout.mockRejectedValue(new Error('Checkout unavailable. Please retry.'));
  render(<MemoryRouter initialEntries={['/pricing?plan=pro&billing=annual']}><Pricing/></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button',{name:'Continue to checkout'}));
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.getByText('Checkout unavailable. Please retry.')).toBeTruthy();
  expect(screen.getByRole('button',{name:'Continue to checkout'}).disabled).toBe(false);
  expect(screen.getByRole('heading',{name:'Your Pro plan'})).toBeTruthy();
  expect(openCheckout).not.toHaveBeenCalled();
 });
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

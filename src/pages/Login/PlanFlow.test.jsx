import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Login from './Login';
import Signup from '../Signup/Signup';
import SignupSuccess from '../Signup/SignupSuccess';
import VerifyEmail from '../VerifyEmail/VerifyEmail';
import { pendingPlanSelection, rememberPlanSelection } from '../../utils/planSelection';

const auth= { isAuthenticated:false, login:vi.fn() };
vi.mock('../../context/AuthContext',()=>({useAuth:()=>auth}));
vi.mock('../../services/Utils',()=>({handleSuccess:vi.fn(),handleError:vi.fn()}));
vi.mock('../../components/Auth/AuthLayout',()=>({default:({children})=><div>{children}</div>}));
vi.mock('@react-oauth/google',()=>{
 function GoogleButton({onSuccess}) { return <button onClick={()=>onSuccess({credential:'test-google-token'})}>Continue with Google</button>; }
 GoogleButton.propTypes={onSuccess:PropTypes.func.isRequired};
 return {GoogleLogin:GoogleButton};
});

function Destination(){const location=useLocation();return <h1>{location.pathname+location.search}</h1>;}
function routes(entry){return <MemoryRouter initialEntries={[entry]}><Routes><Route path="/login" element={<Login/>}/><Route path="/signup" element={<Signup/>}/><Route path="/signup-success" element={<SignupSuccess/>}/><Route path="/verify-email/:uid/:token" element={<VerifyEmail/>}/><Route path="/pricing" element={<Destination/>}/><Route path="/" element={<Destination/>}/></Routes></MemoryRouter>;}
beforeEach(()=>{vi.resetAllMocks();localStorage.clear();auth.isAuthenticated=false;vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({token:{access:'test-access',refresh:'test-refresh'}}),{headers:{'content-type':'application/json'}})));});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});

describe('authentication with a selected plan',()=>{
 it('keeps the choice when switching between account creation and sign-in',async()=>{
  render(routes('/signup?plan=premium&billing=annual'));
  fireEvent.click(screen.getByRole('link',{name:'Sign in'}));
  expect(await screen.findByRole('heading',{name:'Welcome back.'})).toBeTruthy();
  expect(screen.getByRole('link',{name:'Create an account'}).getAttribute('href')).toBe('/signup?plan=premium&billing=annual');
 });
 it('returns email login to the selected plan rather than the dashboard',async()=>{
  render(routes('/login?plan=pro&billing=annual'));
  fireEvent.change(screen.getByLabelText('Email address'),{target:{value:'learner@example.test'}});
  fireEvent.change(screen.getByLabelText('Password'),{target:{value:'examplepass1'}});
  fireEvent.click(screen.getByRole('button',{name:'Sign in',exact:true}));
  expect(await screen.findByRole('heading',{name:'/pricing?plan=pro&billing=annual'})).toBeTruthy();
  expect(auth.login).toHaveBeenCalledWith({access:'test-access',refresh:'test-refresh'});
 });
 it('returns Google signup to the selected plan',async()=>{
  render(routes('/signup?plan=premium&billing=monthly'));
  fireEvent.click(screen.getByRole('button',{name:'Continue with Google'}));
  expect(await screen.findByRole('heading',{name:'/pricing?plan=premium&billing=monthly'})).toBeTruthy();
 });
 it('keeps email signup choice on the verification instructions and sign-in link',async()=>{
  render(routes('/signup?plan=pro&billing=annual'));
  fireEvent.change(screen.getByLabelText('Full name'),{target:{value:'Example Learner'}});
  fireEvent.change(screen.getByLabelText('Email address'),{target:{value:'learner@example.test'}});
  fireEvent.change(screen.getByLabelText('Password'),{target:{value:'examplepass1'}});
  fireEvent.change(screen.getByLabelText('Confirm password'),{target:{value:'examplepass1'}});
  fireEvent.click(screen.getByRole('button',{name:'Create account',exact:true}));
  expect(await screen.findByRole('heading',{name:'Signup Successful!'})).toBeTruthy();
  expect(screen.getByRole('link',{name:'Login'}).getAttribute('href')).toBe('/login?plan=pro&billing=annual');
  expect(pendingPlanSelection()).toEqual({plan:'pro',billing:'annual'});
 });
 it('sends an existing signed-in user directly to their plan review',async()=>{
  auth.isAuthenticated=true;
  render(routes('/signup?plan=pro&billing=annual'));
  expect(await screen.findByRole('heading',{name:'/pricing?plan=pro&billing=annual'})).toBeTruthy();
 });
 it('restores the plan after an email verification link opens without query parameters',async()=>{
  rememberPlanSelection({plan:'pro',billing:'annual'});
  vi.useFakeTimers();
  render(routes('/verify-email/example-user/example-token'));
  await act(async()=>{await Promise.resolve();});
  await act(async()=>{await vi.advanceTimersByTimeAsync(3000);});
  expect(screen.getByRole('heading',{name:'Welcome back.'})).toBeTruthy();
  expect(screen.getByRole('link',{name:'Create an account'}).getAttribute('href')).toBe('/signup?plan=pro&billing=annual');
 });
 it('keeps ordinary login going to the dashboard',async()=>{
  render(routes('/login'));
  fireEvent.click(screen.getByRole('button',{name:'Continue with Google'}));
  expect(await screen.findByRole('heading',{name:'/'})).toBeTruthy();
 });
});

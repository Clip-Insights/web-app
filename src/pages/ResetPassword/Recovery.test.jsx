import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ResetPasswordEmail from './ResetPasswordEmail';
import ResetPasswordNew from './ResetPasswordNew';
import VerifyEmail from '../VerifyEmail/VerifyEmail';
import { requestPasswordReset, updatePassword, verifyEmail, resendVerification } from '../../services/accountService';
vi.mock('../../services/accountService', () => ({requestPasswordReset:vi.fn(),updatePassword:vi.fn(),verifyEmail:vi.fn(),resendVerification:vi.fn()}));
const show = (path, element, route = path) => render(<MemoryRouter initialEntries={[path]}><Routes><Route path={route} element={element}/></Routes></MemoryRouter>);
beforeEach(() => { vi.resetAllMocks(); localStorage.clear(); });
describe('account recovery', () => {
  it('retains the entered email after failure and shows a confirmation after retry', async () => {
    requestPasswordReset.mockRejectedValueOnce(new Error('Check your connection.')).mockResolvedValueOnce({});
    show('/reset-password', <ResetPasswordEmail/>);
    fireEvent.change(screen.getByLabelText('Email address'), {target:{value:'learner@example.test'}});
    fireEvent.click(screen.getByRole('button',{name:'Send reset link'}));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByLabelText('Email address').value).toBe('learner@example.test');
    fireEvent.click(screen.getByRole('button',{name:'Send reset link'}));
    await screen.findByRole('heading',{name:'Check your inbox.'});
    expect(requestPasswordReset).toHaveBeenLastCalledWith('learner@example.test');
  });
  it('blocks mismatched passwords and offers a new link when the reset token expires', async () => {
    updatePassword.mockRejectedValue(Object.assign(new Error('Reset token expired.'), {status:400}));
    show('/reset-password/user/token', <ResetPasswordNew/>, '/reset-password/:uid/:token');
    fireEvent.change(screen.getByLabelText('New password'),{target:{value:'securepass1'}});
    fireEvent.change(screen.getByLabelText('Confirm password'),{target:{value:'different1'}});
    fireEvent.click(screen.getByRole('button',{name:'Update password'}));
    expect(updatePassword).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toMatch(/don’t match/);
    fireEvent.change(screen.getByLabelText('Confirm password'),{target:{value:'securepass1'}});
    fireEvent.click(screen.getByRole('button',{name:'Update password'}));
    expect(await screen.findByRole('link',{name:'Request a new reset link'})).toBeTruthy();
  });
  it('offers an explicit sign-in step after a successful password update', async () => {
    updatePassword.mockResolvedValue({});
    show('/reset-password/user/token',<ResetPasswordNew/>, '/reset-password/:uid/:token');
    fireEvent.change(screen.getByLabelText('New password'),{target:{value:'securepass1'}});
    fireEvent.change(screen.getByLabelText('Confirm password'),{target:{value:'securepass1'}});
    fireEvent.click(screen.getByRole('button',{name:'Update password'}));
    await screen.findByRole('heading',{name:'You’re ready to sign in.'});
    expect(screen.getByRole('link',{name:'Back to sign in'}).getAttribute('href')).toBe('/login');
  });
  it('recovers an expired verification link without losing the selected plan', async () => {
    verifyEmail.mockRejectedValue(Object.assign(new Error('This link expired.'),{status:400}));
    resendVerification.mockResolvedValue({});
    show('/verify-email/user/token?plan=pro&billing=annual',<VerifyEmail/>, '/verify-email/:uid/:token');
    await screen.findByRole('heading',{name:'Let’s get you a fresh link.'});
    fireEvent.change(screen.getByLabelText('Email address'),{target:{value:'learner@example.test'}});
    fireEvent.click(screen.getByRole('button',{name:'Resend verification email'}));
    await screen.findByText('Verification email sent. Use the latest link in your inbox.');
    expect(screen.getByRole('link',{name:'Back to sign in'}).getAttribute('href')).toBe('/login?plan=pro&billing=annual');
  });
});

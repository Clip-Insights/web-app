import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AuthGuard from './AuthGuard';
vi.mock('../../context/AuthContext',()=>({useAuth:()=>({isAuthenticated:false,isLoading:false,sessionExpired:true})}));
function LoginDestination() { const {state}=useLocation(); return <p>{state.reason}:{state.from}</p>; }
describe('protected destinations',()=>{
 it('preserves the exact local destination and explains session expiration',()=>{
  render(<MemoryRouter initialEntries={['/files/course?sort=name']}><Routes><Route path="/files/:id" element={<AuthGuard><p>Private content</p></AuthGuard>}/><Route path="/login" element={<LoginDestination/>}/></Routes></MemoryRouter>);
  expect(screen.getByText('expired:/files/course?sort=name')).toBeTruthy();
  expect(screen.queryByText('Private content')).toBeNull();
 });
});

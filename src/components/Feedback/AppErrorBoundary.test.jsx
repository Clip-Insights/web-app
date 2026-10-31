import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AppErrorBoundary from './AppErrorBoundary';
function BrokenPage() { throw new Error('Internal technical details'); }
describe('application recovery',()=>{
 it('shows recovery actions without exposing technical error details',()=>{
  const error=vi.spyOn(console,'error').mockImplementation(()=>{});
  try {
   render(<AppErrorBoundary><BrokenPage/></AppErrorBoundary>);
   expect(screen.getByRole('heading',{name:'Something interrupted your workspace.'})).toBeTruthy();
   expect(screen.getByRole('button',{name:'Try again'})).toBeTruthy();
   expect(screen.queryByText('Internal technical details')).toBeNull();
  } finally { error.mockRestore(); }
 });
});

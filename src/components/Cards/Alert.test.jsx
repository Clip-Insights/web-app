import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { toast } from 'react-toastify';
import Alert from './Alert';
vi.mock('react-toastify',()=>({toast:Object.assign(vi.fn(()=>1),{dismiss:vi.fn()})}));
describe('notification replacement',()=>{
 it('does not dismiss a newer notification when an older one finishes closing',()=>{
  const close=vi.fn();
  const {rerender}=render(<Alert message="First update" onClose={close}/>);
  const oldClose=toast.mock.calls[0][1].onClose;
  rerender(<Alert message="Second update" onClose={close}/>);
  oldClose();
  expect(close).not.toHaveBeenCalled();
  toast.mock.calls[1][1].onClose();
  expect(close).toHaveBeenCalledTimes(1);
 });
});

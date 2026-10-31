import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RenamePopup from './RenamePopup';

describe('rename progress', () => {
 it('prevents duplicate submissions and preserves the edited name on failure', async () => {
  let reject;
  const onRename=vi.fn().mockReturnValue(new Promise((_,fail)=>{reject=fail;}));
  render(<RenamePopup fileName="Lesson" onRename={onRename} onCancel={vi.fn()} />);
  fireEvent.change(screen.getByLabelText('File name'),{target:{value:'My lesson'}});
  fireEvent.click(screen.getByRole('button',{name:'Save name'}));
  expect(screen.getByRole('button',{name:'Saving…'}).disabled).toBe(true);
  expect(screen.getByRole('button',{name:'Cancel'}).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button',{name:'Saving…'}));
  expect(onRename).toHaveBeenCalledTimes(1);
  await act(async()=>reject(new Error('offline')));
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.getByLabelText('File name').value).toBe('My lesson');
  expect(screen.getByRole('button',{name:'Save name'}).disabled).toBe(false);
 });
});

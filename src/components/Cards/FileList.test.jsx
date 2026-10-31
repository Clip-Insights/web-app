import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileList from './FileList';

const files = [1, 2, 3].map(id => ({ id, name: `Lesson ${id}.pdf`, path: '#', size: 1000 }));
const props = { files, onRename: vi.fn(), onDelete: vi.fn(), onMove: vi.fn(), folders: [{ id: 7, name: 'Learning' }] };
describe('bulk file controls', () => {
  it('places select-all in the header and reflects partial selection', () => {
    render(<FileList {...props} compact onBulkAction={vi.fn()} />);
    const all = screen.getByLabelText('Select all visible files');
    expect(all.closest('thead')).toBeTruthy();
    expect(screen.queryByText('Select files')).toBeNull();
    fireEvent.click(screen.getByLabelText('Select Lesson 1.pdf'));
    expect(all.indeterminate).toBe(true);
    fireEvent.click(all);
    expect(all.checked).toBe(true);
    expect(all.indeterminate).toBe(false);
    fireEvent.click(all);
    expect(screen.getAllByRole('checkbox').every(input => !input.checked)).toBe(true);
  });
  it('distinguishes unfiled files from an assigned folder whose name has not loaded', () => {
    const { rerender } = render(<FileList {...props} files={[{ ...files[0], folder_id: null }]} />);
    expect(screen.getByText('No folder')).toBeTruthy();
    rerender(<FileList {...props} files={[{ ...files[0], folder_id: '00000000-0000-0000-0000-000000000000' }]} />);
    expect(screen.getByText('No folder')).toBeTruthy();
    rerender(<FileList {...props} files={[{ ...files[0], folder_id: 99 }]} />);
    expect(screen.queryByText('No folder')).toBeNull();
    expect(screen.getByText('In a folder')).toBeTruthy();
  });
  it('shows the current folder without repeating the file type below the name', () => {
    const file = { ...files[0], folder_id: '7' };
    const { rerender } = render(<FileList {...props} files={[file]} />);
    expect(screen.getByText('Learning')).toBeTruthy();
    expect(screen.getAllByText('PDF')).toHaveLength(1);
    rerender(<FileList {...props} files={[{ ...file, folder_id: 8 }]} folders={[...props.folders, { id: 8, name: 'Research' }]} />);
    expect(screen.queryByText('Learning')).toBeNull();
    expect(screen.getByText('Research')).toBeTruthy();
  });
  it('requires confirmation and retains only failed files for retry', async () => {
    const onBulkAction = vi.fn().mockResolvedValue({ successfulIds: [1, 3], failedIds: [2] });
    render(<FileList {...props} onBulkAction={onBulkAction} />);
    fireEvent.click(screen.getByLabelText('Select all visible files'));
    fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));
    expect(onBulkAction).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Delete files', exact: true }));
    await waitFor(() => expect(onBulkAction).toHaveBeenCalledWith([1, 2, 3], 'delete', undefined));
    await waitFor(() => expect(screen.getByLabelText('Select Lesson 2.pdf').checked).toBe(true));
    expect(screen.getByLabelText('Select Lesson 1.pdf').checked).toBe(false);
    expect(screen.getByRole('status').textContent).toContain('1 could not be changed');
  });
  it('supports modifier-click without opening files and passes the selected ids to move', async () => {
    const onBulkAction = vi.fn().mockResolvedValue({ successfulIds: [1, 2, 3], failedIds: [] });
    render(<FileList {...props} onBulkAction={onBulkAction} />);
    fireEvent.click(screen.getByRole('link', { name: 'Open Lesson 1.pdf' }), { ctrlKey: true });
    fireEvent.click(screen.getByRole('link', { name: 'Open Lesson 3.pdf' }), { shiftKey: true });
    expect(screen.getByText('3 selected')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Move', exact: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Learning', exact: true }));
    await waitFor(() => expect(onBulkAction).toHaveBeenCalledWith([1, 2, 3], 'move', 7));
  });
});

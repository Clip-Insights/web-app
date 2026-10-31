import { describe, it, expect, vi } from 'vitest';
import { applyFileOperation } from './fileService';

describe('bulk file requests', () => {
  it('keeps successful and failed ids separate when one request fails', async () => {
    const request = vi.fn().mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValueOnce({});
    expect(await applyFileOperation(request, [1, 2, 3], 'delete')).toEqual({ successfulIds: [1, 3], failedIds: [2] });
    expect(request.mock.calls.map(([config]) => config.data.file_id)).toEqual([1, 2, 3]);
    expect(request.mock.calls[0][0].method).toBe('delete');
  });
  it('uses the existing patch contract for moving each file', async () => {
    const request = vi.fn().mockResolvedValue({});
    await applyFileOperation(request, [4], 'move', 9);
    expect(request.mock.calls[0][0]).toMatchObject({ method: 'patch', data: { file_id: 4, folder_id: 9 } });
  });
});

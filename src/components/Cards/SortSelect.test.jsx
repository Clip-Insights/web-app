import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SortSelect from './SortSelect';

beforeAll(() => { Element.prototype.scrollIntoView = vi.fn(); });
const options = ['Latest', 'Oldest', 'Name (A-Z)', 'Name (Z-A)', 'Size (Small-Large)', 'Size (Large-Small)'];
function Example() {
  const [sort, setSort] = useState('Latest');
  return <SortSelect value={sort} onChange={setSort} options={options} />;
}

describe('sort dropdown', () => {
  it('supports keyboard selection and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{End}{Enter}');
    await waitFor(() => expect(trigger.textContent).toContain('Size: largest first'));
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
  it('closes on Escape without changing the selected value', async () => {
    const user = userEvent.setup();
    render(<Example />);
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Escape}');
    expect(screen.getByRole('combobox').textContent).toContain('Newest first');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });
});

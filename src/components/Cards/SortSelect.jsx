import { Fragment } from 'react';
import PropTypes from 'prop-types';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

const labels = {
  Latest: 'Newest first',
  Oldest: 'Oldest first',
  'Name (A-Z)': 'Name (A–Z)',
  'Name (Z-A)': 'Name (Z–A)',
  'Size (Small-Large)': 'Size: smallest first',
  'Size (Large-Small)': 'Size: largest first',
};

export default function SortSelect({ value, onChange, options }) {
  return (
    <div className="ml-auto flex items-center gap-3">
      <span className="text-xs text-auth-muted">Sort by</span>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger aria-label="Sort files and folders" className="group inline-flex h-11 min-w-44 items-center justify-between gap-4 rounded-lg border border-auth-line bg-white px-3 text-sm text-auth-ink transition-colors hover:border-auth-field focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auth-accent data-[state=open]:border-auth-field">
          <Select.Value>{labels[value] || value}</Select.Value>
          <Select.Icon asChild><ChevronDown size={16} className="text-auth-muted transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none" /></Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content position="popper" align="end" sideOffset={8} collisionPadding={12} className="z-[60] max-h-[var(--radix-select-content-available-height)] w-60 overflow-hidden rounded-xl border border-auth-line bg-white p-1.5 font-primary shadow-lg">
            <Select.Viewport>
              {options.map((option, index) => (
                <Fragment key={option}>
                  {index > 0 && index % 2 === 0 && <Select.Separator className="mx-2 my-1.5 h-px bg-auth-line" />}
                  <Select.Item value={option} className="relative flex min-h-11 cursor-default select-none items-center rounded-lg py-2 pl-3 pr-9 text-sm text-auth-ink outline-none data-[highlighted]:bg-auth-panel data-[state=checked]:font-medium data-[state=checked]:text-auth-accent">
                    <Select.ItemText>{labels[option] || option}</Select.ItemText>
                    <Select.ItemIndicator className="absolute right-3"><Check size={16} aria-hidden="true" /></Select.ItemIndicator>
                  </Select.Item>
                </Fragment>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

SortSelect.propTypes = { value: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired, options: PropTypes.arrayOf(PropTypes.string).isRequired };

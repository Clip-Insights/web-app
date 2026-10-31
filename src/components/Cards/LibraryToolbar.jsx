import PropTypes from 'prop-types';
import SortSelect from './SortSelect';
import { Search } from 'lucide-react';

export default function LibraryToolbar({ title, description, count, query, onQueryChange, sort, onSortChange, sortOptions, action, children }) {
  return <>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-semibold tracking-tight text-auth-ink">{title}</h1><p className="mt-1 text-sm leading-6 text-auth-muted">{description}</p></div>
      <div className="shrink-0">{action}</div>
    </div>
    {children}
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:max-w-xs"><Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 text-auth-muted" /><input type="search" aria-label={`Search ${title}`} placeholder={`Search ${title.toLowerCase()}…`} value={query} onChange={(e) => onQueryChange(e.target.value)} className="h-11 w-full rounded-lg border border-auth-line bg-white pl-10 pr-3 text-sm text-auth-ink placeholder:text-auth-muted focus:border-auth-accent focus:outline-none focus:ring-1 focus:ring-auth-accent" /></div>
      <span className="text-xs tabular-nums text-auth-muted">{count} {count === 1 ? 'item' : 'items'}</span>
      <SortSelect value={sort} onChange={onSortChange} options={sortOptions} />
    </div>
  </>;
}
LibraryToolbar.propTypes = { title: PropTypes.string.isRequired, description: PropTypes.string.isRequired, count: PropTypes.number.isRequired, query: PropTypes.string.isRequired, onQueryChange: PropTypes.func.isRequired, sort: PropTypes.string.isRequired, onSortChange: PropTypes.func.isRequired, sortOptions: PropTypes.arrayOf(PropTypes.string).isRequired, action: PropTypes.node, children: PropTypes.node };

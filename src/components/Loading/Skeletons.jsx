import PropTypes from 'prop-types';

export function Skeleton({ className = '' }) {
  return <span aria-hidden="true" className={`block animate-pulse bg-auth-line/60 motion-reduce:animate-none ${className.includes('rounded-') ? '' : 'rounded-md'} ${className}`} />;
}
Skeleton.propTypes = { className: PropTypes.string };

export function FileListSkeleton({ compact = false }) {
  return <div role="status" aria-label="Loading files" aria-busy="true" className="rounded-xl border border-auth-line bg-white">
    <div aria-hidden="true" className="flex h-12 items-center gap-6 border-b border-auth-line px-6"><Skeleton className="h-5 w-5 rounded-full" /><Skeleton className="h-3 w-16" /></div>
    {[0,1,2,3].map(row => <div key={row} aria-hidden="true" className="flex min-h-16 items-center gap-5 border-b border-auth-line px-6 py-3 last:border-0">
      <Skeleton className="h-5 w-5 shrink-0 rounded-full" /><Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2"><Skeleton className={row % 2 ? 'h-3 w-2/3 max-w-64' : 'h-3 w-3/4 max-w-80'} /><Skeleton className="h-2.5 w-24" /></div>
      <Skeleton className="hidden h-3 w-24 md:block" />{!compact && <Skeleton className="ml-4 hidden h-3 w-12 sm:block" />}<Skeleton className="ml-3 h-2 w-5 shrink-0" />
    </div>)}
  </div>;
}
FileListSkeleton.propTypes = { compact: PropTypes.bool };

export function FolderGridSkeleton() {
  return <div role="status" aria-label="Loading folders" aria-busy="true" className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
    {[0,1,2,3,4,5].map(row => <div key={row} aria-hidden="true" className="flex min-h-20 items-center gap-3 rounded-xl border border-auth-line bg-white p-4"><Skeleton className="h-10 w-10 shrink-0 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-2.5 w-24" /></div><Skeleton className="h-2 w-5" /></div>)}
  </div>;
}

export function FolderOptionsSkeleton() {
  return <div role="status" aria-label="Loading folder destinations" aria-busy="true" className="space-y-1">{[0,1,2].map(row => <div key={row} aria-hidden="true" className="flex h-12 items-center gap-3 px-3"><Skeleton className="h-5 w-5" /><Skeleton className="h-3 w-2/3" /></div>)}</div>;
}

export function PricingSkeleton() {
  return <div role="status" aria-label="Loading plans" aria-busy="true" className="grid grid-cols-1 gap-6 md:grid-cols-3">{[0,1,2].map(card => <div key={card} aria-hidden="true" className="rounded-xl border border-auth-line bg-white p-6 sm:p-8">
    <Skeleton className="h-3 w-16" /><Skeleton className="mt-4 h-10 w-28" /><Skeleton className="mt-3 h-10 w-full" /><Skeleton className="mb-6 mt-4 h-11 w-full rounded-lg" />
    <div className="space-y-4">{[0,1,2,3,4,5,6,7].map(row => <div key={row} className="flex items-center gap-3"><Skeleton className="h-3 w-3 shrink-0" /><Skeleton className="h-3 flex-1" /><Skeleton className="h-3 w-12" /></div>)}</div>
  </div>)}</div>;
}

export function ProfileSkeleton() {
  return <div role="status" aria-label="Loading profile" aria-busy="true" className="mt-5 grid gap-5 sm:grid-cols-2">{[0,1].map(row => <div key={row} aria-hidden="true" className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-4 w-3/4 max-w-64" /></div>)}</div>;
}
export function PlanDetailsSkeleton() {
  return <div role="status" aria-label="Loading account plan" aria-busy="true"><Skeleton className="mt-2 h-5 w-24" /><div aria-hidden="true" className="mt-5 grid gap-5 border-t border-auth-line pt-5 sm:grid-cols-3">{[0,1,2].map(row => <div key={row} className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-4 w-20" /></div>)}</div></div>;
}
export function UsageSkeleton() {
  return <div role="status" aria-label="Loading AI usage" aria-busy="true" className="flex h-full min-h-80 flex-col rounded-2xl border border-auth-line bg-white p-6">
    <Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-3 w-48" /><div aria-hidden="true" className="my-8 flex-1 space-y-6">{[0,1].map(row => <div key={row}><div className="mb-2 flex justify-between"><Skeleton className="h-3 w-36" /><Skeleton className="h-3 w-10" /></div><Skeleton className="h-2 w-full rounded-full" /></div>)}</div><div aria-hidden="true" className="flex items-center justify-between gap-4 border-t border-auth-line pt-4"><Skeleton className="h-8 w-40" /><Skeleton className="h-11 w-32 rounded-lg" /></div>
  </div>;
}
export function StorageSkeleton() {
  return <div role="status" aria-label="Loading storage" aria-busy="true" className="flex h-full min-h-80 flex-col rounded-2xl border border-auth-line bg-white p-6"><Skeleton className="h-4 w-20" /><Skeleton className="mt-2 h-3 w-48" /><div aria-hidden="true" className="flex flex-1 flex-col items-center justify-center py-4"><div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-auth-line/60"><Skeleton className="h-6 w-14" /></div><Skeleton className="mt-4 h-4 w-32" /><Skeleton className="mt-2 h-3 w-24" /></div></div>;
}

import { Skeleton } from './Skeletons';

export default function SessionLoading() {
  return <div role="status" aria-label="Opening your workspace" className="flex min-h-screen flex-col bg-auth-panel p-6 text-auth-ink sm:p-8"><img src="/Logo/wordmark.svg" alt="Clip Insights" className="h-8 w-fit" /><div className="m-auto w-full max-w-sm space-y-5"><p className="text-sm text-auth-muted">Opening your workspace…</p><Skeleton className="h-8 w-2/3" /><Skeleton className="h-24 w-full rounded-xl" /></div></div>;
}

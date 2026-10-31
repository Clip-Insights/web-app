import { useEffect, useState } from 'react';

export default function useAsyncResource(load) {
  const [attempt, setAttempt] = useState(0);
  const [resource, setResource] = useState({ status: 'loading', data: null });
  useEffect(() => {
    let active = true;
    setResource({ status: 'loading', data: null });
    load().then(data => { if (active) setResource({ status: 'ready', data }); })
      .catch(() => { if (active) setResource({ status: 'error', data: null }); });
    return () => { active = false; };
  }, [load, attempt]);
  return { ...resource, retry: () => setAttempt(value => value + 1) };
}

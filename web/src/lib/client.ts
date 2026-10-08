'use client';
import { useCallback, useEffect, useState } from 'react';
export { track } from '@/lib/analytics';

let identityBootstrap: Promise<unknown> | undefined;
function initializeGuest() {
  if (!identityBootstrap) identityBootstrap = fetch('/api/identity', { credentials: 'same-origin', cache: 'no-store' }).then(response => { if (!response.ok) throw new Error('Unable to initialize Curevo.'); return response.json(); }).catch(error => { identityBootstrap = undefined; throw error; });
  return identityBootstrap;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Finish the HttpOnly identity cookie before parallel resource requests. This
  // prevents first-visit races from assigning multiple guest histories.
  if (typeof window !== 'undefined') {
    const identity = await initializeGuest();
    if (path === '/api/identity') return identity as T;
  }
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init.headers }, credentials: 'same-origin', cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data as T;
}
export function useResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(n => n + 1), []);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    let active = true;
    const load = async () => {
      try { const result = await api<T>(path, { signal: controller.signal }); if (active) { setData(result); setError(''); } }
      catch (e) { if (active && !controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to load.'); }
      finally { if (active) setLoading(false); }
    };
    void load();
    const timer = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 15000);
    const updated = () => { void load(); };
    window.addEventListener('curevo:update', updated);
    window.addEventListener('online', updated);
    return () => { active = false; controller.abort(); clearInterval(timer); window.removeEventListener('curevo:update', updated); window.removeEventListener('online', updated); };
  }, [path, revision]);
  return { data, error, loading, refresh };
}
export function formatTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return new Date(value).toLocaleDateString('en', { month:'short', day:'numeric' });
}

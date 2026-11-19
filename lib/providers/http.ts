const cache = new Map<string, { expires: number; value: unknown }>();

export function cached<T>(key: string): T | undefined {
  const item = cache.get(key);
  if (!item || item.expires < Date.now()) { cache.delete(key); return undefined; }
  return item.value as T;
}
export function remember<T>(key: string, value: T, ttlMs: number): T {
  cache.set(key, { value, expires: Date.now() + ttlMs });
  if (cache.size > 200) cache.delete(cache.keys().next().value ?? '');
  return value;
}
export async function timedFetch(url: string, init: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' }); }
  finally { clearTimeout(timer); }
}

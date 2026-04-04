const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface Entry {
  count: number;
  windowStart: number;
}

const store = new Map<string, Entry>();

export function checkRateLimit(ip: string): { allowed: boolean } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= LIMIT) {
    return { allowed: false };
  }

  entry.count += 1;
  return { allowed: true };
}

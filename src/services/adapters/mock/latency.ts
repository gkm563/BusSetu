/**
 * Simulates real network latency so the UI exercises loading/skeleton
 * states even against mock adapters. When the real WebSocket/REST
 * adapters replace these, remove the wrappers.
 */
export function simulateLatency(minMs = 140, maxMs = 340): Promise<void> {
  const jitter = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, jitter));
}

export async function withLatency<T>(
  value: T | Promise<T>,
  minMs?: number,
  maxMs?: number,
): Promise<T> {
  await simulateLatency(minMs, maxMs);
  return value;
}

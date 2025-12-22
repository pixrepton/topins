/**
 * utils.ts
 *
 * Narzędzia pomocnicze
 */

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function safeNumber(n: unknown): number | null {
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function warnPush(arr: string[], msg: string) {
  if (!arr.includes(msg)) arr.push(msg);
}

export function assumePush(arr: string[], msg: string) {
  if (!arr.includes(msg)) arr.push(msg);
}

/**
 * batchLogger.ts
 *
 * Logger porównań do pliku JSONL (na testy regresji)
 */

import { OZCComparison } from './types';

export type BatchLogEntry = {
  timestamp: string;
  payloadHash: string;
  comparison: OZCComparison;
};

/**
 * Zapisuje pojedyncze porównanie do JSONL
 */
export function logComparison(
  comparison: OZCComparison,
  filePath: string = 'ozc_comparisons.jsonl'
): void {
  const entry: BatchLogEntry = {
    timestamp: new Date().toISOString(),
    payloadHash: comparison.payloadEchoHash,
    comparison
  };

  const line = JSON.stringify(entry) + '\n';

  // W przeglądarce: użyj localStorage lub IndexedDB
  // W Node.js: użyj fs.appendFileSync
  if (typeof window !== 'undefined') {
    // Browser: zapisz do localStorage jako array
    try {
      const existing = localStorage.getItem('ozc_comparisons');
      const arr: BatchLogEntry[] = existing ? JSON.parse(existing) : [];
      arr.push(entry);
      localStorage.setItem('ozc_comparisons', JSON.stringify(arr));
    } catch (e) {
      console.warn('Failed to save comparison to localStorage:', e);
    }
  } else {
    // Node.js: użyj fs (wymaga importu)
    const fs = require('fs');
    fs.appendFileSync(filePath, line, 'utf8');
  }
}

/**
 * Czyta wszystkie porównania z localStorage (browser) lub pliku (Node.js)
 */
export function readComparisons(
  filePath: string = 'ozc_comparisons.jsonl'
): BatchLogEntry[] {
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('ozc_comparisons');
      return existing ? JSON.parse(existing) : [];
    } catch {
      return [];
    }
  } else {
    const fs = require('fs');
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    return content
      .split('\n')
      .filter((line: string) => line.trim())
      .map((line: string) => JSON.parse(line));
  }
}

/**
 * Czyści logi
 */
export function clearComparisons(filePath: string = 'ozc_comparisons.jsonl'): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ozc_comparisons');
  } else {
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

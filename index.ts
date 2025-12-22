/**
 * index.ts
 *
 * Główny punkt wejścia dla silnika OZC
 */

export { calculateOZC } from './calculateOZC';
export type { CieploApiPayload, OZCResult, NormalizedBuildingModel } from './types';
export { mapFromCieploPayload } from './cieploMapper';
export { calcHT } from './transmission';
export { calcHV } from './ventilation';
export { computeGeometry } from './geometry';
export { resolveClimate } from './climate';
export { computeAdditiveCorrectionsKw, DEFAULT_CORRECTIONS_CONFIG } from './corrections';
export type { CorrectionsConfig } from './corrections';

// Adapter porównawczy
export { compareOZC, compareOZCBatch } from './compare';
export type { OZCComparison, CieploApiResult } from './types';
export { callCieploApi, normalizeCieploResult } from './cieploClient';
export type { CieploClientConfig } from './cieploClient';
export { explainDiff } from './explainDiff';
export { logComparison, readComparisons, clearComparisons } from './batchLogger';

/**
 * cieploClient.ts
 *
 * Klient HTTP do API cieplo.app z timeoutem i obsługą błędów
 */

import { CieploApiPayload, CieploApiResult } from './types';

export type CieploClientConfig = {
  endpointUrl: string; // np. https://api.cieplo.app/... (twoje)
  apiKey?: string; // jeśli wymagane
  timeoutMs?: number; // np. 4500
  headers?: Record<string, string>;
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout after ${timeoutMs}ms`)), timeoutMs);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

export async function callCieploApi(
  payload: CieploApiPayload,
  cfg: CieploClientConfig
): Promise<{ status: number; data: unknown; durationMs: number }> {
  const t0 = Date.now();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    ...(cfg.headers ?? {})
  };

  const res = await withTimeout(
    fetch(cfg.endpointUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    }),
    cfg.timeoutMs ?? 4500
  );

  const status = res.status;
  const text = await res.text();
  let data: unknown = text;

  try {
    data = JSON.parse(text);
  } catch {
    // zostawiamy jako tekst
  }

  return { status, data, durationMs: Date.now() - t0 };
}

/**
 * Ujednolica wynik cieplo.app do minimalnego kontraktu (kW + opcjonalny breakdown).
 * Dostosuj "extract" do prawdziwej struktury odpowiedzi cieplo.app.
 */
export function normalizeCieploResult(raw: unknown): CieploApiResult {
  const out: CieploApiResult = { raw };

  if (!raw || typeof raw !== 'object') return out;

  const r = raw as any;

  // Najczęstsze pola spotykane w API: spróbujmy kilku nazw bez zgadywania fizyki.
  const kW =
    (typeof r?.designHeatLoss_kW === 'number' ? r.designHeatLoss_kW : null) ??
    (typeof r?.heatLoadKw === 'number' ? r.heatLoadKw : null) ??
    (typeof r?.heat_loss_kw === 'number' ? r.heat_loss_kw : null) ??
    (typeof r?.result?.max_heating_power === 'number' ? r.result.max_heating_power : null) ??
    (typeof r?.max_heating_power === 'number' ? r.max_heating_power : null) ??
    null;

  const W =
    (typeof r?.designHeatLoss_W === 'number' ? r.designHeatLoss_W : null) ??
    (typeof r?.heatLoadW === 'number' ? r.heatLoadW : null) ??
    (typeof r?.heat_loss_w === 'number' ? r.heat_loss_w : null) ??
    null;

  if (typeof kW === 'number') out.designHeatLoss_kW = kW;
  if (typeof W === 'number') out.designHeatLoss_W = W;

  // breakdown, jeśli jest:
  if (r?.breakdown && typeof r.breakdown === 'object') {
    out.breakdown = {
      transmission:
        typeof r.breakdown.transmission === 'number' ? r.breakdown.transmission : undefined,
      ventilation:
        typeof r.breakdown.ventilation === 'number' ? r.breakdown.ventilation : undefined,
      bridges: typeof r.breakdown.bridges === 'number' ? r.breakdown.bridges : undefined
    };
  }

  return out;
}

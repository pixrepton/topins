/**
 * compare.ts
 *
 * Główny adapter porównawczy: cieplo.app vs fallback
 */

import { calculateOZC } from './calculateOZC';
import { callCieploApi, normalizeCieploResult, CieploClientConfig } from './cieploClient';
import { explainDiff } from './explainDiff';
import { CieploApiPayload, OZCComparison } from './types';

// Helper do ładowania danych JSON
// W Node.js: require(), w przeglądarce: fetch() lub wbudowane dane
function loadData(): {
  defaults: any;
  windows: any;
  doors: any;
  ventilation: any;
  climate: any;
  materials: any;
} {
  // W przeglądarce: użyj wbudowanych danych (jak w ozc-engine.js)
  // W Node.js: użyj require()
  if (typeof window === 'undefined') {
    // Node.js
    const path = require('path');
    const fs = require('fs');
    const dataDir = path.join(__dirname, '../data');
    return {
      defaults: JSON.parse(fs.readFileSync(path.join(dataDir, 'defaults.json'), 'utf8')),
      windows: JSON.parse(fs.readFileSync(path.join(dataDir, 'windows.json'), 'utf8')),
      doors: JSON.parse(fs.readFileSync(path.join(dataDir, 'doors.json'), 'utf8')),
      ventilation: JSON.parse(fs.readFileSync(path.join(dataDir, 'ventilation.json'), 'utf8')),
      climate: JSON.parse(fs.readFileSync(path.join(dataDir, 'climate.json'), 'utf8')),
      materials: JSON.parse(fs.readFileSync(path.join(dataDir, 'materials.json'), 'utf8'))
    };
  } else {
    // Browser: użyj wbudowanych danych (jak w ozc-engine.js)
    return {
      defaults: {
        fallback: {
          U_wall: 0.6,
          U_roof: 0.3,
          U_floor: 0.4,
          U_window: 1.3,
          U_door: 1.8,
          window_area_per_piece_m2: 1.6,
          huge_window_area_m2: 4.0,
          door_area_m2: 2.0,
          balcony_door_area_m2: 2.2,
          roof_area_factor: { flat: 1.05, oblique: 1.15, steep: 1.25 }
        },
        corrections: { thermalBridgesMultiplier: 1.1, safetyFactor: 1.1 }
      },
      windows: {
        old_single_glass: 2.8,
        old_double_glass: 2.5,
        semi_new_double_glass: 2.0,
        new_double_glass: 1.3,
        new_triple_glass: 0.9,
        '2021_double_glass': 1.0,
        '2021_triple_glass': 0.8
      },
      doors: {
        old_wooden: 3.0,
        old_metal: 3.5,
        new_wooden: 1.8,
        new_metal: 1.5,
        new_pvc: 1.3
      },
      ventilation: {
        natural: { ach: 0.8, eta_rec: 0.0 },
        mechanical: { ach: 0.6, eta_rec: 0.0 },
        mechanical_recovery: { ach: 0.6, eta_rec: 0.85 }
      },
      climate: {
        PL_III: { theta_e: -20, theta_m_e: 7.0 },
        PL_IV: { theta_e: -22, theta_m_e: 6.0 }
      },
      materials: {
        '57': { lambda: 0.25 },
        '88': { lambda: 0.036 },
        '68': { lambda: 0.04 }
      }
    };
  }
}

function stableHash(obj: unknown): string {
  // "hash" deterministyczny bez crypto (wystarcza do logów/debug)
  const s = JSON.stringify(obj, Object.keys(obj as any).sort());
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return 'h' + (h >>> 0).toString(16);
}

/**
 * Porównuje wynik cieplo.app z naszym fallbackiem
 * Zwraca szczegółowy raport różnic
 */
export async function compareOZC(
  payload: CieploApiPayload,
  cieploCfg: CieploClientConfig
): Promise<OZCComparison> {
  const payloadEchoHash = stableHash(payload);

  // Załaduj dane JSON
  const data = loadData();

  // Oblicz offline
  const offlineRes = calculateOZC(
    payload,
    data.defaults,
    data.windows,
    data.doors,
    data.ventilation,
    data.climate,
    data.materials
  );

  // Próba online
  let onlineOk = false;
  let onlineKW: number | undefined = undefined;
  let status: number | undefined = undefined;
  let error: string | undefined = undefined;
  let durationMs: number | undefined = undefined;
  let normalized: any = undefined;

  try {
    const r = await callCieploApi(payload, cieploCfg);
    status = r.status;
    durationMs = r.durationMs;

    if (r.status >= 200 && r.status < 300) {
      normalized = normalizeCieploResult(r.data);
      const kW =
        typeof normalized.designHeatLoss_kW === 'number'
          ? normalized.designHeatLoss_kW
          : typeof normalized.designHeatLoss_W === 'number'
            ? normalized.designHeatLoss_W / 1000
            : undefined;

      if (typeof kW === 'number' && Number.isFinite(kW) && kW > 0) {
        onlineOk = true;
        onlineKW = kW;
      } else {
        error =
          'cieplo.app response parsed but heat loss not found (update normalizeCieploResult mapping).';
      }
    } else {
      error = `HTTP ${r.status}`;
    }
  } catch (e: any) {
    error = e?.message ?? String(e);
  }

  const offKW = offlineRes.designHeatLoss_kW;

  const abs_kW = typeof onlineKW === 'number' ? Math.abs(offKW - onlineKW) : undefined;
  const pct =
    typeof onlineKW === 'number' && onlineKW !== 0 ? (abs_kW! / onlineKW) * 100 : undefined;

  const explanation = explainDiff({ payload, offline: offlineRes, onlineKW });

  return {
    ok: true,
    payloadEchoHash,
    online: {
      ok: onlineOk,
      status,
      error,
      durationMs,
      result: normalized
    },
    offline: {
      ok: true,
      result: offlineRes
    },
    delta: {
      offline_kW: offKW,
      online_kW: onlineKW,
      abs_kW,
      pct
    },
    explanation,
    notes: {
      assumptions: offlineRes.assumptions ?? [],
      warnings: offlineRes.warnings ?? []
    }
  };
}

/**
 * Batch comparison - porównuje wiele payloadów
 * Zwraca ranking największych rozjazdów
 */
export async function compareOZCBatch(
  payloads: Array<{ id: string; payload: CieploApiPayload }>,
  cieploCfg: CieploClientConfig,
  onProgress?: (current: number, total: number, id: string) => void
): Promise<{
  results: Array<OZCComparison & { id: string }>;
  summary: {
    total: number;
    onlineOk: number;
    avgDeltaPct: number;
    maxDeltaPct: number;
    topDiscrepancies: Array<{ id: string; deltaPct: number }>;
  };
}> {
  const results: Array<OZCComparison & { id: string }> = [];

  for (let i = 0; i < payloads.length; i++) {
    const { id, payload } = payloads[i];
    if (onProgress) onProgress(i + 1, payloads.length, id);

    try {
      const comp = await compareOZC(payload, cieploCfg);
      results.push({ ...comp, id });
    } catch (e: any) {
      results.push({
        ok: false,
        id,
        payloadEchoHash: stableHash(payload),
        online: { ok: false, error: e?.message ?? String(e) },
        offline: { ok: false, result: {} as any },
        delta: { offline_kW: 0 },
        explanation: { headline: 'Error', bullets: [], suspects: [] },
        notes: { assumptions: [], warnings: [] }
      });
    }
  }

  const onlineOk = results.filter((r) => r.online.ok).length;
  const withDelta = results.filter(
    (r) => r.online.ok && typeof r.delta.pct === 'number'
  );
  const deltas = withDelta.map((r) => r.delta.pct!);
  const avgDeltaPct = deltas.length > 0 ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0;
  const maxDeltaPct = deltas.length > 0 ? Math.max(...deltas) : 0;

  const topDiscrepancies = withDelta
    .map((r) => ({ id: r.id, deltaPct: r.delta.pct! }))
    .sort((a, b) => b.deltaPct - a.deltaPct)
    .slice(0, 10);

  return {
    results,
    summary: {
      total: payloads.length,
      onlineOk,
      avgDeltaPct,
      maxDeltaPct,
      topDiscrepancies
    }
  };
}

/**
 * explainDiff.ts
 *
 * Diagnostyka różnic między cieplo.app a naszym fallbackiem
 * Bazuje na wiedzy z rev_engine (odwrotna inżynieria cieplo.app)
 */

import { CieploApiPayload, OZCResult } from './types';

function pct(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return NaN;
  return (a / b) * 100;
}

/**
 * Wyjaśnia różnice między wynikiem offline a online
 * Bazuje na wiedzy z rev_engine:
 * - Okna mają największy wpływ (dyskretne klasy: -0.5kW do +2.4kW)
 * - Wentylacja z rekuperacją: ~-1kW / -1.8MWh/rok
 * - Rok budowy NIE wpływa na wynik
 * - Geometria jest prawie liniowa
 */
export function explainDiff(params: {
  payload: CieploApiPayload;
  offline: OZCResult;
  onlineKW?: number;
}): {
  headline: string;
  bullets: string[];
  suspects: Array<{ label: string; weight: number; details: string[] }>;
} {
  const { payload, offline, onlineKW } = params;

  const bullets: string[] = [];
  const suspects: Array<{ label: string; weight: number; details: string[] }> = [];

  const offKW = offline.designHeatLoss_kW;
  const offWm2 = offline.heatLossPerM2;

  if (typeof onlineKW === 'number') {
    const abs = Math.abs(offKW - onlineKW);
    const p = pct(abs, onlineKW);
    bullets.push(`Δ = ${abs.toFixed(2)} kW (${p.toFixed(1)}% vs cieplo.app).`);
  } else {
    bullets.push(`Brak porównania z cieplo.app (offline-only fallback).`);
  }

  bullets.push(`Offline: ${offKW.toFixed(2)} kW, ~${Math.round(offWm2)} W/m².`);

  // 1) Najczęstsze przyczyny: brak danych w payloadzie → defaults
  const missingSignals: string[] = [];
  for (const w of offline.warnings ?? []) {
    if (/Missing|Unknown|fallback/i.test(w)) missingSignals.push(w);
  }
  if (missingSignals.length) {
    suspects.push({
      label: 'Braki w payloadzie → defaults.json',
      weight: 0.85,
      details: missingSignals.slice(0, 6)
    });
    bullets.push(`Wykryto braki danych – fallback użył defaults.json (zobacz warnings).`);
  }

  // 2) Wentylacja: udział w całości (offline)
  // Z rev_engine: mechanical_recovery daje ~-1kW / -1.8MWh/rok
  const phiV = offline.breakdown.ventilation;
  const phiT = offline.breakdown.transmission;
  const phiPsi = offline.breakdown.bridges;
  const total = phiV + phiT + phiPsi;

  if (total > 0) {
    const vShare = phiV / total;
    bullets.push(
      `Udział wentylacji w offline: ~${Math.round(vShare * 100)}%. (typ: ${payload.ventilation_type})`
    );
    if (vShare > 0.35) {
      suspects.push({
        label: 'Wentylacja/infiltracja dominuje',
        weight: 0.7,
        details: [
          `Offline ventilation_type=${payload.ventilation_type}`,
          `Z rev_engine: mechanical_recovery daje ~-1kW vs natural.`,
          `Jeśli cieplo.app liczy inne ACH/strumienie lub ma korekty (osłonięcie, szczelność), różnica będzie duża.`
        ]
      });
    }

    // Sprawdź czy mamy rekuperację
    if (payload.ventilation_type === 'mechanical_recovery') {
      suspects.push({
        label: 'Rekuperacja - duży wpływ na wynik',
        weight: 0.8,
        details: [
          `Z rev_engine: mechanical_recovery vs natural = ~-1kW / -1.8MWh/rok`,
          `Sprawdź czy offline poprawnie uwzględnia eta_rec (sprawność odzysku).`
        ]
      });
    }
  }

  // 3) Okna: Z rev_engine - NAJWIĘKSZY wpływ (dyskretne klasy)
  // old_single_glass: +2.4kW, old_double_glass: +1.7kW, new_double_glass: 0 (baseline)
  // new_triple_glass: -0.3kW, 2021_triple_glass: -0.5kW
  if ((payload.number_huge_windows ?? 0) > 0 || (payload.number_windows ?? 0) > 0) {
    const winType = payload.windows_type ?? 'unknown';
    suspects.push({
      label: 'Okna - największy wpływ na wynik (z rev_engine)',
      weight: 0.9,
      details: [
        `windows_type=${winType}, number_windows=${payload.number_windows ?? 0}, number_huge_windows=${payload.number_huge_windows ?? 0}`,
        `Z rev_engine: różnice między typami okien to -0.5kW do +2.4kW (dyskretne klasy).`,
        `Jeśli cieplo.app używa innych U_okien lub wyznacza okna z geometrii, rozjazd jest normalny.`,
        `Powierzchnia okien liczona heurystyką (sztuki → m²) może różnić się od rzeczywistej.`
      ]
    });
  }

  // 4) Drzwi: Z rev_engine - mniejszy wpływ niż okna, ale mierzalny
  // old_wooden: +0.2kW, old_metal: +0.1kW, new_*: ~0kW
  if ((payload.number_doors ?? 0) > 0 || (payload.number_balcony_doors ?? 0) > 0) {
    const doorType = payload.doors_type ?? 'unknown';
    suspects.push({
      label: 'Drzwi - mniejszy wpływ niż okna',
      weight: 0.5,
      details: [
        `doors_type=${doorType}, number_doors=${payload.number_doors ?? 0}, number_balcony_doors=${payload.number_balcony_doors ?? 0}`,
        `Z rev_engine: różnice między typami drzwi to ~0kW do +0.2kW (addytywne z oknami).`
      ]
    });
  }

  // 5) Ściany: jeśli wall_size jest 0 / brak → liczymy z P*h*floors
  if (!payload.wall_size || payload.wall_size <= 0) {
    suspects.push({
      label: 'Ściany policzone z geometrii (P*h*floors) zamiast wall_size',
      weight: 0.8,
      details: [
        'payload.wall_size brak/0 → offline liczy A_walls z obrysu.',
        'To potrafi zmienić wynik o kilkanaście %.',
        'Z rev_engine: geometria jest prawie liniowa - ±10% wymiaru = ±0.4kW.'
      ]
    });
  }

  // 6) Klimat: dopóki resolver jest fallback (PL_III), to przy innych strefach będzie błąd
  // Z rev_engine: temperatura wewnętrzna ±2°C = ±0.25kW / ±1MWh/rok
  suspects.push({
    label: 'Strefa klimatyczna (lat/lon → zone) wciąż fallback',
    weight: 0.6,
    details: [
      'Na start resolver zwraca PL_III. To MUSI zostać podmienione na prawdziwy mapping.',
      'Różnica 2–4°C w theta_e potrafi dać spory %.',
      'Z rev_engine: zmiana indoor_temperature o ±2°C = ±0.25kW / ±1MWh/rok.'
    ]
  });

  // 7) Przestrzenie nieogrzewane (z rev_engine)
  // has_basement + unheated_space_under_type: worst→great = -0.1kW do -0.4kW
  if (payload.has_basement) {
    const underType = (payload as any).unheated_space_under_type ?? 'unknown';
    suspects.push({
      label: 'Przestrzenie nieogrzewane (piwnica)',
      weight: 0.5,
      details: [
        `has_basement=true, unheated_space_under_type=${underType}`,
        `Z rev_engine: wpływ piwnicy to -0.1kW do -0.4kW (zależnie od izolacji).`,
        `Offline może nie uwzględniać tego w pełni.`
      ]
    });
  }

  // 8) Rok budowy - Z rev_engine: NIE wpływa na wynik!
  // To potwierdza nasze założenie "zero roku budowy"
  if (typeof (payload as any).construction_year === 'number') {
    bullets.push(
      `Z rev_engine: construction_year NIE wpływa na wynik (potwierdza nasze założenie "zero roku budowy").`
    );
  }

  // Heurystyczny nagłówek
  const headline = missingSignals.length
    ? 'Najpewniej różnica wynika z braków w payloadzie → defaults + heurystyki pól przegród.'
    : 'Różnica najpewniej wynika z wentylacji/okien lub mapowania klimatu (lat/lon).';

  // Posortuj suspecty po wadze
  suspects.sort((a, b) => b.weight - a.weight);

  return { headline, bullets, suspects };
}

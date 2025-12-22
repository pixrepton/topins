/**
 * types.ts
 *
 * Typy dla silnika OZC
 * Wejście = payload API cieplo.app (1:1)
 */

export type CieploApiPayload = {
  building_type: string;
  latitude: number;
  longitude: number;

  building_length?: number;
  building_width?: number;
  floor_area?: number;
  floor_perimeter?: number;
  building_shape?: 'regular' | 'irregular';

  building_floors: number;
  building_heated_floors: number[];
  floor_height: number;

  building_roof: 'flat' | 'oblique' | 'steep';

  has_basement: boolean;
  has_balcony: boolean;
  garage_type?: string;

  wall_size: number;
  primary_wall_material: number;
  secondary_wall_material?: number;

  internal_wall_isolation?: { material: number; size: number };
  external_wall_isolation?: { material: number; size: number };

  top_isolation?: { material: number; size: number };
  bottom_isolation?: { material: number; size: number };

  // UPROSZCZONY TRYB DLA SINGLE_HOUSE
  detailed_insulation_mode?: boolean;
  walls_insulation_level?: 'poor' | 'average' | 'good' | 'very_good';
  roof_insulation_level?: 'poor' | 'average' | 'good' | 'very_good';
  floor_insulation_level?: 'poor' | 'average' | 'good' | 'very_good';

  number_doors: number;
  number_balcony_doors: number;
  number_windows: number;
  number_huge_windows: number;

  doors_type?: string; // Opcjonalne dla single_house w trybie uproszczonym
  windows_type: string;

  indoor_temperature: number;
  ventilation_type: 'natural' | 'mechanical' | 'mechanical_recovery';

  whats_over?: string;
  whats_under?: string;
  whats_north?: string;
  whats_south?: string;
  whats_east?: string;
  whats_west?: string;
  on_corner?: boolean;
};

export type NormalizedBuildingModel = {
  areas: {
    walls: number;
    roof: number;
    floor: number;
    windows: number;
    doors: number;
  };

  U: {
    wall: number;
    roof: number;
    floor: number;
    window: number;
    door: number;
  };

  geometry: {
    volume: number;
    perimeter: number;
    Bprime: number;
    length: number;
    width: number;
  };

  climate: {
    zoneId: string;
    theta_e: number;
    theta_m_e: number;
  };

  ventilation: {
    V_dot_m3h: number;
    eta_rec: number;
  };

  corrections: {
    thermalBridgesMultiplier: number;
    safetyFactor: number;
  };

  assumptions: string[];
  warnings: string[];
};

export type OZCResult = {
  designHeatLoss_W: number;
  designHeatLoss_kW: number;
  heatLossPerM2: number;

  breakdown: {
    transmission: number;
    ventilation: number;
    bridges: number;
  };

  assumptions: string[];
  warnings: string[];
};

/**
 * Typy dla adaptera porównawczego (cieplo.app vs fallback)
 */

export type CieploApiResult = {
  // Minimalny kontrakt – nie zakładamy pełnej struktury cieplo.app,
  // tylko to, co umiemy "zmapować" do designHeatLoss.
  designHeatLoss_W?: number;
  designHeatLoss_kW?: number;

  // jeżeli cieplo ma breakdown – super, ale opcjonalnie:
  breakdown?: {
    transmission?: number;
    ventilation?: number;
    bridges?: number;
  };

  raw?: unknown; // na wszelki wypadek
};

export type OZCComparison = {
  ok: boolean;

  payloadEchoHash: string;

  online: {
    ok: boolean;
    status?: number;
    error?: string;
    result?: CieploApiResult;
    durationMs?: number;
  };

  offline: {
    ok: boolean;
    result: OZCResult;
  };

  delta: {
    offline_kW: number;
    online_kW?: number;
    abs_kW?: number;
    pct?: number; // offline vs online
  };

  explanation: {
    headline: string;
    bullets: string[];
    suspects: Array<{
      label: string;
      weight: number; // 0..1
      details: string[];
    }>;
  };

  notes: {
    assumptions: string[];
    warnings: string[];
  };
};

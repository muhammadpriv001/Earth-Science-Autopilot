// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — CHAT EVIDENCE BUILDER
// ==============================================================================
// The Explore AI answers must be grounded in measurements, not adjectives.
// This module retrieves the live NASA POWER / NSIDC series for the active
// variable at the selected coordinates and derives the same statistics the
// analysis engine reports (mean, extremes, Sen's slope, Mann-Kendall p-value,
// recent anomaly). The resulting evidence block is injected into the LLM prompt
// and also rendered directly when no inference provider is reachable.
//
// Server-only. Nothing here is synthesised: when a variable has no live source
// the evidence records that explicitly instead of inventing numbers.
// ==============================================================================

import { getLiveDataset } from '@/lib/providers/live-earth-data';
import {
  findExistingTask,
  getVegetationSeries,
  isAppeearsConfigured,
} from '@/lib/providers/appeears';
import { mannKendallTest } from '@/lib/science/mann-kendall';
import { calculateSensSlope } from '@/lib/science/sens-slope';
import { getVariableById } from '@/lib/science/earth-variables';
import { GeographicRegion } from '@/types';

export interface ChatEvidence {
  variableId: string;
  variableName: string;
  unit: string;
  available: boolean;
  reason?: string;
  provider?: string;
  datasetName?: string;
  sourceUrl?: string;
  observationCount?: number;
  startDate?: string;
  endDate?: string;
  mean?: number;
  min?: { value: number; date: string };
  max?: { value: number; date: string };
  latest?: { value: number; date: string };
  baselineMean?: number;
  recentMean?: number;
  anomaly?: number;
  senSlopePerYear?: number;
  decadalChange?: number;
  mkP?: number;
  mkTrend?: string;
  mkSignificant?: boolean;
  /** Human-readable evidence block for prompts and fallback answers. */
  promptBlock: string;
}

const POWER_VARIABLES = new Set([
  'air-temperature',
  'land-surface-temperature',
  'precipitation',
  'soil-moisture',
  'sea-ice-extent',
]);

export function isPowerBackedVariable(variableId: string): boolean {
  return POWER_VARIABLES.has(variableId);
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatDate(iso: string): string {
  return iso.slice(0, 7);
}

/** Aggregates monthly observations into annual means (or totals for precipitation). */
function annualSeries(
  observations: Array<{ date: string; value: number }>,
  annualSum: boolean
): Array<{ year: number; value: number }> {
  const buckets = new Map<number, number[]>();
  for (const obs of observations) {
    const year = parseInt(obs.date.slice(0, 4), 10);
    if (!Number.isFinite(year)) continue;
    const list = buckets.get(year) || [];
    list.push(obs.value);
    buckets.set(year, list);
  }

  const series: Array<{ year: number; value: number }> = [];
  for (const [year, values] of [...buckets.entries()].sort((a, b) => a[0] - b[0])) {
    // Only keep complete calendar years so partial years do not bias the trend.
    if (values.length < 12) continue;
    const value = annualSum
      ? values.reduce((sum, v) => sum + v, 0)
      : values.reduce((sum, v) => sum + v, 0) / values.length;
    series.push({ year, value });
  }
  return series;
}

function unavailableEvidence(variableId: string, reason: string): ChatEvidence {
  const variable = getVariableById(variableId);
  const variableName = variable?.name || variableId;
  const unit = variable?.unit || '';
  return {
    variableId,
    variableName,
    unit,
    available: false,
    reason,
    promptBlock: [
      'LIVE DATA STATUS: unavailable',
    `Variable: ${variableName}${unit ? ` (${unit})` : ''}`,
    `Why it is missing: ${reason}`,
    'We cannot invent numbers or trends. State the limitation and explain how to obtain the dataset.',
    'How to obtain this dataset:',
    '1. Add the product to a NASA AppEEARS point task',
    '2. AppEEARS returns a CSV of measured values for these coordinates, usually within a few minutes',
    '3. Once data is available, trends (Mann-Kendall test, Sen\'s slope) can be computed',
    '4. Visit the Analysis page to plot the full time series and export a scientific dossier',
    ].join('\n'),
  };
}

export async function buildVegetationEvidence(variableId: string, region: GeographicRegion): Promise<ChatEvidence> {
  if (variableId === 'ndvi') {
    return unavailableEvidence(
      variableId,
      'NDVI requires a MOD13Q1/VNP13A1 AppEEARS point task, which must be requested from the Vegetation workspace first.'
    );
  }
  if (variableId === 'evi') {
    return unavailableEvidence(
      variableId,
      'EVI requires a MOD13Q1/VNP13A1 AppEEARS point task, which must be requested from the Vegetation workspace first.'
    );
  }
  return unavailableEvidence(variableId, `Unexpected vegetation variable ${variableId}`);
}

export async function buildChatEvidence(params: {
  variableId: string;
  region: GeographicRegion;
  startDate?: string;
  endDate?: string;
}): Promise<ChatEvidence> {
  const { variableId, region } = params;

  if (variableId === 'ndvi' || variableId === 'evi') {
    return buildVegetationEvidence(variableId, region);
  }

  if (!isPowerBackedVariable(variableId)) {
    return unavailableEvidence(
      variableId,
      `No keyless live measurement archive is connected for ${variableId}. NASA POWER covers temperature, precipitation, soil moisture and sea ice; vegetation indices require NASA AppEEARS (MOD13Q1/VNP13A1), which is requested separately from the Vegetation workspace.`
    );
  }

  try {
    const dataset = await getLiveDataset({
      variableId,
      region,
      startDate: params.startDate || '1994-01-01',
      endDate: params.endDate || new Date().toISOString().slice(0, 10),
    });

    const observations = dataset.observations.filter(o => Number.isFinite(o.value));
    if (observations.length === 0) {
      return unavailableEvidence(variableId, 'The live archive returned no valid observations for this footprint.');
    }

    const annual = annualSeries(observations, variableId === 'precipitation');
    if (annual.length < 5) {
      return unavailableEvidence(
        variableId,
        'Fewer than five complete years of measurements were returned, which is insufficient to confidently detect a real change. More data is needed to draw firm conclusions.'
      );
    }

    const years = annual.map(a => a.year);
    const values = annual.map(a => a.value);

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const minPoint = annual.reduce((a, b) => (b.value < a.value ? b : a));
    const maxPoint = annual.reduce((a, b) => (b.value > a.value ? b : a));

    const latestMonthly = observations[observations.length - 1];

    const baselineWindow = annual.slice(0, Math.min(10, Math.max(5, Math.floor(annual.length / 3))));
    const recentWindow = annual.slice(-5);
    const baselineMean = baselineWindow.reduce((sum, a) => sum + a.value, 0) / baselineWindow.length;
    const recentMean = recentWindow.reduce((sum, a) => sum + a.value, 0) / recentWindow.length;

    let senSlopePerYear: number | undefined;
    let mkP: number | undefined;
    let mkTrend: string | undefined;
    let mkSignificant: boolean | undefined;

    try {
      const sens = calculateSensSlope(years, values);
      senSlopePerYear = sens.slopePerYear;
      const mk = mannKendallTest(values);
      mkP = mk.pValue;
      mkTrend = mk.trendDirection;
      mkSignificant = mk.isSignificant;
    } catch {
      // Too few usable points: the summary still reports what was measured.
    }

    const digits = variableId === 'soil-moisture' ? 3 : 2;
    const anomaly = recentMean - baselineMean;

    const lines: string[] = [
      'LIVE MEASURED DATA (use these exact numbers; never contradict them):',
      `Provider: ${dataset.provider} — ${dataset.datasetName}`,
      `Variable: ${dataset.variableName} (${dataset.unit})`,
      `Footprint: ${region.name} centred on ${region.center?.[1]?.toFixed(4)}°N, ${region.center?.[0]?.toFixed(4)}°E`,
      `Coverage: ${formatDate(observations[0].date)} to ${formatDate(observations[observations.length - 1].date)} (${observations.length} monthly values, ${annual.length} complete years)`,
      `Annual mean: ${round(mean, digits)} ${dataset.unit}`,
      `Lowest year: ${minPoint.year} at ${round(minPoint.value, digits)} ${dataset.unit}`,
      `Highest year: ${maxPoint.year} at ${round(maxPoint.value, digits)} ${dataset.unit}`,
      `Latest month (${formatDate(latestMonthly.date)}): ${round(latestMonthly.value, digits)} ${dataset.unit}`,
      `Early baseline mean (${baselineWindow[0].year}–${baselineWindow[baselineWindow.length - 1].year}): ${round(baselineMean, digits)} ${dataset.unit}`,
      `Recent mean (${recentWindow[0].year}–${recentWindow[recentWindow.length - 1].year}): ${round(recentMean, digits)} ${dataset.unit}`,
      `Recent anomaly versus baseline: ${anomaly >= 0 ? '+' : ''}${round(anomaly, digits)} ${dataset.unit}`,
    ];

    if (senSlopePerYear !== undefined) {
      lines.push(
        `Sen's slope: ${senSlopePerYear >= 0 ? '+' : ''}${round(senSlopePerYear, digits === 3 ? 4 : 3)} ${dataset.unit} per year (change of ${round(senSlopePerYear * 10, digits === 3 ? 3 : 2)} ${dataset.unit} per decade)`
      );
    }
    if (mkP !== undefined) {
      lines.push(
        `Trend test: ${mkTrend}, p = ${mkP < 0.0001 ? '<0.0001' : round(mkP, 4)}. This test checks if the observed change is real or just random variation. ${mkSignificant ? 'The change is likely real (statistically significant)' : 'The change could be due to random variation (not statistically significant)'}`
      );
    }
    lines.push(`Citation: ${dataset.provenance.citation}`);

    return {
      variableId: dataset.variableId,
      variableName: dataset.variableName,
      unit: dataset.unit,
      available: true,
      provider: dataset.provider,
      datasetName: dataset.datasetName,
      sourceUrl: dataset.provenance.sourceUrl,
      observationCount: observations.length,
      startDate: observations[0].date,
      endDate: observations[observations.length - 1].date,
      mean: round(mean, digits),
      min: { value: round(minPoint.value, digits), date: String(minPoint.year) },
      max: { value: round(maxPoint.value, digits), date: String(maxPoint.year) },
      latest: { value: round(latestMonthly.value, digits), date: latestMonthly.date },
      baselineMean: round(baselineMean, digits),
      recentMean: round(recentMean, digits),
      anomaly: round(anomaly, digits),
      senSlopePerYear: senSlopePerYear === undefined ? undefined : round(senSlopePerYear, 4),
      decadalChange: senSlopePerYear === undefined ? undefined : round(senSlopePerYear * 10, 3),
      mkP,
      mkTrend,
      mkSignificant,
      promptBlock: lines.join('\n'),
    };
  } catch (err) {
    return unavailableEvidence(
      variableId,
      err instanceof Error ? err.message : 'The live archive could not be reached for this footprint.'
    );
  }
}
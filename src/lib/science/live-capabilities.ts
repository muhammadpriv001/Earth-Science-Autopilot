// ==============================================================================
// LIVE CAPABILITY CATALOG (CLIENT-SAFE)
// ==============================================================================
// Single source of truth for which Earth-system variables currently have a
// verified, keyless live measurement source. Client components import this to
// keep every variable dropdown aligned with what the API can actually plot.
//
// Sources wired in src/lib/providers/live-earth-data.ts:
//  • NASA POWER monthly point API  → air temperature, land-surface temperature,
//                                    precipitation, root-zone soil moisture
//  • NSIDC Sea Ice Index (G02135)  → September Arctic sea-ice extent
// ==============================================================================

import { EARTH_VARIABLES } from '@/lib/science/earth-variables';
import type { EarthVariable } from '@/types';

export const LIVE_VARIABLE_IDS = [
  'air-temperature',
  'land-surface-temperature',
  'precipitation',
  'soil-moisture',
  'sea-ice-extent',
] as const;

export type LiveVariableId = (typeof LIVE_VARIABLE_IDS)[number];

export type LiveCategoryId = 'climate' | 'water' | 'cryosphere';

export interface LiveCategory {
  id: LiveCategoryId;
  label: string;
  shortLabel: string;
  variableIds: LiveVariableId[];
}

export const LIVE_CATEGORY_LABELS: Record<LiveCategoryId, string> = {
  climate: 'Atmosphere & Climate',
  water: 'Water & Soil Moisture',
  cryosphere: 'Cryosphere & Sea Ice',
};

const LIVE_VARIABLE_CATEGORY: Record<LiveVariableId, LiveCategoryId> = {
  'air-temperature': 'climate',
  'land-surface-temperature': 'climate',
  precipitation: 'water',
  'soil-moisture': 'water',
  'sea-ice-extent': 'cryosphere',
};

export const LIVE_VARIABLE_ALIASES: Record<string, LiveVariableId> = {
  temperature: 'air-temperature',
  'sea-ice': 'sea-ice-extent',
  sea_ice: 'sea-ice-extent',
};

/** All live-backed variables in catalog order. */
export const LIVE_VARIABLES: EarthVariable[] = LIVE_VARIABLE_IDS.map(id =>
  EARTH_VARIABLES.find(v => v.id === id)
).filter((v): v is EarthVariable => Boolean(v));

/** Variable groups used for <optgroup> rendering in selects. */
export const LIVE_VARIABLE_GROUPS: LiveCategory[] = (
  ['climate', 'water', 'cryosphere'] as LiveCategoryId[]
).map(id => ({
  id,
  label: LIVE_CATEGORY_LABELS[id],
  shortLabel: LIVE_CATEGORY_LABELS[id],
  variableIds: LIVE_VARIABLE_IDS.filter(v => LIVE_VARIABLE_CATEGORY[v] === id),
}));

export function normaliseLiveVariableId(variableId: string): string {
  return LIVE_VARIABLE_ALIASES[variableId] || variableId;
}

export function isLiveVariableId(variableId: string): variableId is LiveVariableId {
  return (LIVE_VARIABLE_IDS as readonly string[]).includes(
    normaliseLiveVariableId(variableId)
  );
}

/** Resolve any id/alias to a live variable, falling back to air temperature. */
export function resolveLiveVariableId(variableId: string): LiveVariableId {
  const normalised = normaliseLiveVariableId(variableId);
  return isLiveVariableId(normalised) ? normalised : 'air-temperature';
}

export function getLiveVariable(variableId: string): EarthVariable | undefined {
  const normalised = normaliseLiveVariableId(variableId);
  return EARTH_VARIABLES.find(v => v.id === normalised);
}

export function getLiveCategoryForVariable(
  variableId: string
): LiveCategoryId | undefined {
  const normalised = normaliseLiveVariableId(variableId);
  return isLiveVariableId(normalised)
    ? LIVE_VARIABLE_CATEGORY[normalised]
    : undefined;
}

/**
 * Filter live variables by a UI category. `all` (or an omitted value) returns
 * every live-backed variable. Unknown/unavailable categories (for example
 * `vegetation`) intentionally return an empty list so the UI can explain that
 * no live series exists instead of silently plotting nothing.
 */
export function getLiveVariables(category?: string): EarthVariable[] {
  if (!category || category === 'all') return LIVE_VARIABLES;
  return LIVE_VARIABLES.filter(
    variable => LIVE_VARIABLE_CATEGORY[variable.id as LiveVariableId] === category
  );
}

/** Human-readable source note for a live variable. */
export function getLiveSourceLabel(variableId: string): string {
  return normaliseLiveVariableId(variableId) === 'sea-ice-extent'
    ? 'NSIDC Sea Ice Index (G02135)'
    : 'NASA POWER monthly point API';
}

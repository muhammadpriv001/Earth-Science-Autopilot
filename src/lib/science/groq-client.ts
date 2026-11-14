// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — GROQ AI CLIENT
// ==============================================================================
// Uses Groq ultra-fast Llama-3.3-70b inference for natural-language research
// planning and scientific interpretation.
// Docs: https://console.groq.com/docs/openai
// ==============================================================================

import { ResearchPlan, GeographicRegion } from '@/types';
import { EARTH_VARIABLES } from './earth-variables';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export async function generateGroqResearchPlan(
  question: string,
  apiKey: string
): Promise<ResearchPlan | null> {
  if (!apiKey || !apiKey.startsWith('gsk_')) {
    return null;
  }

  const systemPrompt = `You are The Earth Science Autopilot, an expert Earth-observation scientist and geospatial data engineer.
Your task is to convert the user's natural language research question into a structured JSON research plan.

Available Earth Science Variables:
${EARTH_VARIABLES.map(v => `- ID: "${v.id}", Name: "${v.name}", System: "${v.system}", Unit: "${v.unit}"`).join('\n')}

Rules:
1. Choose the most appropriate targetVariable from the list above.
2. Determine geographic center [longitude, latitude] and sensible bounding box.
3. Determine historical time range (e.g. 1994-01-01 to 2024-12-31 for 30 years).
4. Recommend actual NASA CMR / NOAA / ECMWF ERA5 candidate datasets with scientific suitability reasons.
5. Prescribe statistical methods: Mann-Kendall test with tie variance adjustment, Sen's slope estimator, and OLS linear regression.
6. You MUST return ONLY valid JSON without markdown fences, matching this exact structure:
{
  "question": string,
  "targetVariable": string,
  "earthSystem": "Atmosphere" | "Land" | "Ocean" | "Hydrology" | "Cryosphere" | "Ecosystems",
  "targetRegion": {
    "name": string,
    "geometryType": "point" | "bbox" | "polygon",
    "coordinates": number[] | number[][],
    "center": [number, number]
  },
  "timeRange": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "candidateDatasets": [
    {
      "name": string,
      "provider": string,
      "suitabilityReason": string,
      "isLiveAvailable": boolean
    }
  ],
  "temporalResolution": "Daily" | "Monthly" | "Annual",
  "requiredTransformations": string[],
  "statisticalMethods": string[],
  "expectedOutputs": string[]
}`;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      console.warn(`Groq API responded with HTTP ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return parsed as ResearchPlan;
  } catch (err) {
    console.error('Groq AI inference error:', err);
    return null;
  }
}


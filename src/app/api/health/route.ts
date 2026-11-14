// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — HEALTH API
// ==============================================================================

import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET() {
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    application: 'The Earth Science Autopilot',
    version: '1.0.0',
    challenge: 'NASA Space Apps Challenge 2026: Be An Earth System Trend Detective!',
    domain: 'spacegeoai.com',
    providers: {
      nasaCmr: {
        status: 'online',
        endpoint: 'https://cmr.earthdata.nasa.gov',
      },
      openMeteoEra5: {
        status: 'online',
        endpoint: 'https://archive-api.open-meteo.com',
      },
      noaaCdo: {
        status: env.NOAA_CDO_TOKEN ? 'configured' : 'token_missing (fallback active)',
        endpoint: 'https://www.ncei.noaa.gov/cdo-web/api/v2',
      },
      supabase: {
        status: env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'offline_mode (local persistence active)',
      },
      aiAutopilot: {
        status: env.AI_API_KEY ? 'gemini_enabled' : 'deterministic_planner_active',
      },
    },
  };

  return NextResponse.json(status);
}


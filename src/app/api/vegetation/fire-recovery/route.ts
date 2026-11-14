// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — POST-WILDFIRE RECOVERY API ROUTE
// ==============================================================================
// Recovery analysis works only on caller-supplied NDVI observations.
// No benchmark series is substituted when observations are absent.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeFireRecovery } from '@/lib/science/vegetation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    if (!Array.isArray(body.observations) || body.observations.length === 0) {
      return NextResponse.json(
        {
          error:
            'Post-fire recovery requires a supplied NDVI observation series. No live vegetation-index provider is configured on this deployment.',
          code: 'LIVE_DATA_UNAVAILABLE',
        },
        { status: 422 }
      );
    }

    const fireDate = body.fireDate;
    if (!fireDate) {
      return NextResponse.json(
        { error: 'A fireDate (ISO date) is required to align pre- and post-fire observations.' },
        { status: 400 }
      );
    }

    const recoveryAnalysis = analyzeFireRecovery(body.observations, fireDate);

    return NextResponse.json(recoveryAnalysis);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Fire recovery analysis failed' }, { status: 400 });
  }
}

// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — POST-WILDFIRE RECOVERY API ROUTE
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeFireRecovery } from '@/lib/science/vegetation';
import { CALIFORNIA_FIRE_RECOVERY_BENCHMARK } from '@/lib/providers/mock-datasets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const observations = body.observations || CALIFORNIA_FIRE_RECOVERY_BENCHMARK.observations;
    const fireDate = body.fireDate || '2018-11-08';

    const recoveryAnalysis = analyzeFireRecovery(observations, fireDate);

    return NextResponse.json(recoveryAnalysis);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Fire recovery analysis failed' }, { status: 400 });
  }
}


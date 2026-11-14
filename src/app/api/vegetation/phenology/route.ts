// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — VEGETATION PHENOLOGY API ROUTE
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { extractVegetationPhenology } from '@/lib/science/vegetation';
import { SAHEL_VEGETATION_BENCHMARK } from '@/lib/providers/mock-datasets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const observations = body.observations || SAHEL_VEGETATION_BENCHMARK.observations;

    const cycles = extractVegetationPhenology(observations);

    // Calculate long-term phenology shift trends (e.g. days shift in SOS over time)
    let sosTrendDaysPerDecade = 0;
    if (cycles.length >= 5) {
      const n = cycles.length;
      const x = cycles.map((c, i) => i);
      // convert SOS to day of year
      const y = cycles.map(c => {
        const d = new Date(c.startOfSeason);
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        return Math.floor((d.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      });

      const meanX = (n - 1) / 2;
      const meanY = y.reduce((a, b) => a + b, 0) / n;
      let num = 0;
      let den = 0;
      for (let i = 0; i < n; i++) {
        num += (x[i] - meanX) * (y[i] - meanY);
        den += (x[i] - meanX) ** 2;
      }
      const slopePerYear = den > 0 ? num / den : 0;
      sosTrendDaysPerDecade = parseFloat((slopePerYear * 10).toFixed(1));
    }

    return NextResponse.json({
      cycles,
      summary: {
        totalCyclesAnalyzed: cycles.length,
        averageSeasonLengthDays: Math.round(
          cycles.reduce((sum, c) => sum + c.lengthOfSeasonDays, 0) / (cycles.length || 1)
        ),
        averageAmplitude: parseFloat(
          (cycles.reduce((sum, c) => sum + c.seasonalAmplitude, 0) / (cycles.length || 1)).toFixed(3)
        ),
        sosTrendDaysPerDecade,
        phenologicalInterpretation:
          sosTrendDaysPerDecade < -2
            ? `Spring green-up (SOS) has advanced by ${Math.abs(sosTrendDaysPerDecade)} days/decade, consistent with climate warming.`
            : sosTrendDaysPerDecade > 2
            ? `Start of season (SOS) has delayed by ${sosTrendDaysPerDecade} days/decade, likely due to altered monsoon timing or winter chill deficits.`
            : 'Start of growing season has remained relatively stable across the observation period.',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Phenology extraction failed' }, { status: 400 });
  }
}


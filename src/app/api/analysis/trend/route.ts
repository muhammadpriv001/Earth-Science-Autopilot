// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — STATISTICAL TREND ENGINE API ROUTE
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeTimeSeries } from '@/lib/science/time-series-pipeline';
import { TimeSeriesObservation } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dataset = body.dataset;
    const observations: TimeSeriesObservation[] = body.observations || dataset?.observations;
    const variableName: string = body.variableName || dataset?.variableName || 'Earth System Parameter';
    const unit: string = body.unit || dataset?.unit || 'units';
    const alpha: number = body.alpha || body.significanceThreshold || 0.05;

    if (!observations || !Array.isArray(observations) || observations.length === 0) {
      return NextResponse.json(
        { error: 'A non-empty array of time-series observations is required.' },
        { status: 400 }
      );
    }

    // Compute deterministic statistical results
    const results = analyzeTimeSeries(observations, { alpha });

    // Generate grounded scientific interpretation
    let explanation = `Analysis of ${results.validObservations} valid observations for ${variableName} indicates `;

    if (results.isSignificant) {
      const directionWord = results.trendDirection === 'INCREASING' ? 'upward (warming/increasing)' : 'downward (cooling/decreasing)';
      explanation += `a statistically significant ${directionWord} trend at the alpha = ${alpha} significance level (Mann-Kendall p-value = ${results.mannKendallPValue < 0.001 ? '<0.001' : results.mannKendallPValue.toFixed(4)}). `;
      explanation += `The estimated rate of change is ${results.sensSlopePerYear > 0 ? '+' : ''}${results.sensSlopePerYear} ${unit} per year (Sen's non-parametric slope), `;
      explanation += `with an Ordinary Least Squares (OLS) slope of ${results.linearSlopePerYear > 0 ? '+' : ''}${results.linearSlopePerYear} ${unit}/year (R² = ${results.rSquared}).`;
    } else {
      explanation += `no statistically significant monotonic trend at the alpha = ${alpha} threshold (Mann-Kendall p-value = ${results.mannKendallPValue.toFixed(4)}). `;
      explanation += `The observed rate of change (${results.sensSlopePerYear} ${unit}/year) cannot be statistically distinguished from random fluctuations or natural variability within this time window.`;
    }

    explanation += ` Caveat: A low p-value confirms statistical significance of the trend within the analyzed dataset, but does not inherently prove causal mechanisms without controlled physical modeling.`;

    return NextResponse.json({
      results,
      trend: results,
      explanation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Statistical analysis failed', details: err.message },
      { status: 500 }
    );
  }
}


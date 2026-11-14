// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — LIVE VEGETATION INDEX ROUTE
// ==============================================================================
// Returns a real MODIS NDVI/EVI series from NASA AppEEARS for a point.
//
// AppEEARS processing is asynchronous (typically 1–4 minutes), so the route
// never blocks on completion: the first call creates or reuses a task and
// returns its state, and the client polls this endpoint with the task id.
// When the task is done the bundle CSV is parsed and returned once, then cached.
//
// If AppEEARS is not configured or the task fails, the route returns an explicit
// unavailable payload — no synthetic series is ever substituted.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  ensureVegetationTask,
  getTaskState,
  getVegetationSeries,
  isAppeearsConfigured,
  AppeearsError,
} from '@/lib/providers/appeears';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_YEARS = 25;

function isoDate(value: string | null, fallback: string): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return fallback;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  if (!isAppeearsConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        status: 'unavailable',
        message:
          'NASA AppEEARS credentials are not configured. Add NASA_EARTHDATA_USERNAME and NASA_EARTHDATA_PASSWORD to enable live NDVI/EVI.',
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const lat = Number(params.get('lat'));
  const lng = Number(params.get('lng'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ status: 'error', message: 'Valid lat and lng are required.' }, { status: 400 });
  }

  const today = new Date();
  const endDate = isoDate(params.get('end'), today.toISOString().slice(0, 10));
  const defaultStart = `${today.getUTCFullYear() - 10}-01-01`;
  const startDate = isoDate(params.get('start'), defaultStart);

  const spanYears = (Date.parse(endDate) - Date.parse(startDate)) / (365.25 * 24 * 3600 * 1000);
  if (!Number.isFinite(spanYears) || spanYears <= 0) {
    return NextResponse.json({ status: 'error', message: 'The end date must follow the start date.' }, { status: 400 });
  }
  if (spanYears > MAX_YEARS) {
    return NextResponse.json(
      { status: 'error', message: `Please request ${MAX_YEARS} years or fewer per vegetation task.` },
      { status: 400 }
    );
  }

  try {
    const taskParam = params.get('task');
    const state = taskParam
      ? await getTaskState(taskParam)
      : await ensureVegetationTask({
          lat,
          lng,
          startDate,
          endDate,
          label: params.get('name') || 'Study Point',
        });

    if (state.status === 'done') {
      const series = await getVegetationSeries(state.taskId);
      if (!series) {
        return NextResponse.json({
          configured: true,
          status: 'error',
          taskId: state.taskId,
          message: 'AppEEARS finished but the bundle did not contain a parsable NDVI/EVI CSV.',
        });
      }
      return NextResponse.json({
        configured: true,
        status: 'done',
        taskId: state.taskId,
        series,
      });
    }

    if (state.status === 'error') {
      return NextResponse.json({
        configured: true,
        status: 'error',
        taskId: state.taskId,
        message: state.message || 'NASA AppEEARS reported a task error.',
      });
    }

    return NextResponse.json(
      {
        configured: true,
        status: state.status,
        taskId: state.taskId,
        progress: state.progress,
        pollAfterMs: 8000,
        message:
          'NASA AppEEARS is extracting MOD13Q1 NDVI/EVI for this point. This usually takes 1–4 minutes.',
      },
      { status: 202 }
    );
  } catch (err) {
    const status = err instanceof AppeearsError ? err.status : undefined;
    return NextResponse.json(
      {
        configured: true,
        status: 'error',
        message: err instanceof Error ? err.message : 'The vegetation request failed.',
      },
      { status: status && status >= 400 && status < 500 ? 400 : 502 }
    );
  }
}


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

// CORS headers for development
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

function isoDate(value: string | null, fallback: string): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return fallback;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  // Check NASA AppEEARS configuration.
  if (!isAppeearsConfigured()) {
    return withCors(NextResponse.json(
      {
        configured: false,
        status: 'unavailable',
        message:
          'NASA AppEEARS credentials are not configured. Add NASA_EARTHDATA_USERNAME and NASA_EARTHDATA_PASSWORD to enable live NDVI/EVI.',
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      }
    ));
  }

  // Validate coordinates.
  const lat = Number(params.get('lat'));
  const lng = Number(params.get('lng'));

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return withCors(NextResponse.json(
      {
        status: 'error',
        message: 'Valid lat and lng are required.',
      },
      { status: 400 }
    ));
  }

  // Establish the requested date range.
  const today = new Date();

  const endDate = isoDate(
    params.get('end'),
    today.toISOString().slice(0, 10)
  );

  const defaultStart = `${today.getUTCFullYear() - 10}-01-01`;

  const startDate = isoDate(
    params.get('start'),
    defaultStart
  );

  // Validate dates and duration.
  const startTimestamp = Date.parse(`${startDate}T00:00:00Z`);
  const endTimestamp = Date.parse(`${endDate}T00:00:00Z`);

  const spanYears =
    (endTimestamp - startTimestamp) /
    (365.25 * 24 * 60 * 60 * 1000);

  if (
    !Number.isFinite(startTimestamp) ||
    !Number.isFinite(endTimestamp) ||
    spanYears <= 0
  ) {
    return withCors(NextResponse.json(
      {
        status: 'error',
        message: 'The end date must follow the start date, and both dates must be valid.',
      },
      { status: 400 }
    ));
  }

  if (spanYears > MAX_YEARS) {
    return withCors(NextResponse.json(
      {
        status: 'error',
        message: `Please request ${MAX_YEARS} years or fewer per vegetation task.`,
      },
      { status: 400 }
    ));
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

    // Task completed: retrieve the real NDVI/EVI observations.
    if (state.status === 'done') {
      const series = await getVegetationSeries(state.taskId);

      if (!series) {
        return withCors(NextResponse.json(
          {
            configured: true,
            status: 'error',
            taskId: state.taskId,
            message:
              'AppEEARS finished but the bundle did not contain a parsable NDVI/EVI CSV.',
          },
          { status: 502 }
        ));
      }

      return withCors(NextResponse.json(
        {
          configured: true,
          status: 'done',
          taskId: state.taskId,
          series,
        },
        {
          headers: { 'Cache-Control': 'no-store' },
        }
      ));
    }

    // Task failed.
    if (state.status === 'error') {
      return withCors(NextResponse.json(
        {
          configured: true,
          status: 'error',
          taskId: state.taskId,
          message:
            state.message || 'NASA AppEEARS reported a task error.',
        },
        { status: 502 }
      ));
    }

    // Task is still processing: client should poll again.
    return withCors(NextResponse.json(
      {
        configured: true,
        status: state.status,
        taskId: state.taskId,
        progress: state.progress,
        pollAfterMs: 8000,
        message:
          'NASA AppEEARS is extracting MOD13Q1 NDVI/EVI for this point. This usually takes 1–4 minutes.',
      },
      {
        status: 202,
        headers: { 'Cache-Control': 'no-store' },
      }
    ));
  } catch (err) {
    const status =
      err instanceof AppeearsError ? err.status : undefined;

    return withCors(NextResponse.json(
      {
        configured: true,
        status: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'The vegetation request failed.',
      },
      {
        status:
          status && status >= 400 && status < 500
            ? status
            : 502,
        headers: { 'Cache-Control': 'no-store' },
      }
    ));
  }
}

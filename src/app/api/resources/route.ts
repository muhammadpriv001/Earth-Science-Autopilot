// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — RESOURCES CATALOG API ROUTE
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { EXTERNAL_RESOURCES, getResourcesByCategory } from '@/lib/providers/resources-catalog';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');

  if (category) {
    const filtered = getResourcesByCategory(category as any);
    return NextResponse.json({ resources: filtered, total: filtered.length });
  }

  return NextResponse.json({
    resources: EXTERNAL_RESOURCES,
    total: EXTERNAL_RESOURCES.length,
    categories: [
      'NASA Data',
      'Space Agency',
      'Climate & Hydrology',
      'Statistical Methods',
      'Scientific Tutorials',
    ],
  });
}


// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — EXPLORE AI CHAT API ROUTE
// ==============================================================================
// Provides context-aware conversational AI assistance coupled to the GIS map.
// Integrates Groq Llama-3.3-70b inference with deterministic Earth-science fallback.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { EARTH_VARIABLES } from '@/lib/science/earth-variables';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, region, variable, radiusKm, isRadiusLocked } = body;

    const locName = region?.name || 'Selected Location';
    const lat = region?.center ? region.center[1].toFixed(4) : '0.0000';
    const lng = region?.center ? region.center[0].toFixed(4) : '0.0000';
    const radius = radiusKm || 100;
    const currentVar = EARTH_VARIABLES.find(v => v.id === variable) || EARTH_VARIABLES[0];

    // If Groq key is available, use ultra-fast Llama-3.3 inference
    if (env.AI_API_KEY && env.AI_API_KEY.startsWith('gsk_')) {
      const systemPrompt = `You are The Earth Science Autopilot Assistant, an expert Earth-observation scientist and geospatial trend detective designed for the NASA Space Apps Challenge.
You are currently inspecting a specific study region selected on the interactive GIS map:
- Region: ${locName}
- Coordinates: ${lat}° N, ${lng}° E
- Proximity Buffer: ${radius} km radius circle (${isRadiusLocked ? 'LOCKED' : 'FLEXIBLE'})
- Active Earth Science Variable: ${currentVar.name} (${currentVar.unit})

Guidelines:
1. Answer the user's question directly with geospatial and Earth-science accuracy for this exact location and radius.
2. Recommend appropriate satellite observation systems (NASA MODIS, GPM IMERG, SMAP, Landsat, Sentinel, or NOAA CDO).
3. Mention appropriate non-parametric statistical methods for trend detection (Mann-Kendall test, Sen's slope, OLS regression).
4. Keep the answer structured, clear, and informative (use bullet points and bold highlights).
5. Suggest a direct follow-up action (e.g. clicking "Launch Full Analysis" to compute statistical p-values).`;

      try {
        const groqRes = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            temperature: 0.3,
            max_tokens: 650,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const reply = groqData.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({
              reply,
              provenance: 'Groq Llama-3.3-70b Real-Time Inference',
              region: { name: locName, lat, lng, radiusKm: radius },
            });
          }
        }
      } catch (err) {
        console.warn('Groq explore chat fallback:', err);
      }
    }

    // Deterministic High-Quality Fallback Response
    const fallbackReply = `### Geospatial & Trend Assessment for **${locName}**

**Spatial Context:**  
- **Center:** \`${lat}°N, ${lng}°E\`  
- **Proximity Buffer:** \`${radius} km\` radius circle (${isRadiusLocked ? '🔒 Radius Locked' : '🔓 Flexible'})  
- **Focus Variable:** **${currentVar.name}** (\`${currentVar.unit}\`)

**Recommended Datasets for this Area:**
- **NASA MODIS Terra/Aqua (MOD11A2 / MOD13Q1):** High-cadence surface temperature and vegetation indices covering a ${radius} km footprint.
- **ECMWF ERA5 / Open-Meteo Reanalysis:** Daily surface temperature, soil moisture, and atmospheric boundary conditions from 1940 to present.
- **NOAA GHCND / CDO Stations:** Ground-truth meteorological validation stations within the ${radius} km perimeter.

**Statistical Detection Pipeline:**
1. **Aggregated Time Series:** Generate monthly mean observations within the ${radius} km boundary buffer.
2. **Mann-Kendall Test:** Determine monotonic direction with variance adjustment for seasonal ties.
3. **Sen's Non-Parametric Slope:** Calculate robust median change per year ($Q$), immune to extreme outlier years.

> 💡 **Ready to run the analysis?** Click **"Investigate This Region"** above to plot the interactive time series, calculate the Mann-Kendall p-value, and export the scientific dossier.`;

    return NextResponse.json({
      reply: fallbackReply,
      provenance: 'Deterministic Geospatial Scientific Intelligence',
      region: { name: locName, lat, lng, radiusKm: radius },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to process explore chat inquiry' },
      { status: 500 }
    );
  }
}


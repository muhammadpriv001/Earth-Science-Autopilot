// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — TYPED ENVIRONMENT VALIDATION
// ==============================================================================

import { z } from 'zod';

const envSchema = z.object({
  // Public variables
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('The Earth Science Autopilot'),
  NEXT_PUBLIC_APP_TAGLINE: z.string().default('ASK THE EARTH — Search. Investigate. Discover.'),
  NEXT_PUBLIC_MAP_STYLE_URL: z.string().default('https://demotiles.maplibre.org/style.json'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

  // Server-only variables
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NASA_EARTHDATA_USERNAME: z.string().optional(),
  NASA_EARTHDATA_PASSWORD: z.string().optional(),
  NASA_EARTHDATA_CLIENT_ID: z.string().optional(),
  NASA_EARTHDATA_CLIENT_SECRET: z.string().optional(),
  NOAA_CDO_TOKEN: z.string().optional(),
  GEOCODING_API_KEY: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('gemini-1.5-pro'),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_TAGLINE: process.env.NEXT_PUBLIC_APP_TAGLINE,
    NEXT_PUBLIC_MAP_STYLE_URL: process.env.NEXT_PUBLIC_MAP_STYLE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NASA_EARTHDATA_USERNAME: process.env.NASA_EARTHDATA_USERNAME,
    NASA_EARTHDATA_PASSWORD: process.env.NASA_EARTHDATA_PASSWORD,
    NASA_EARTHDATA_CLIENT_ID: process.env.NASA_EARTHDATA_CLIENT_ID,
    NASA_EARTHDATA_CLIENT_SECRET: process.env.NASA_EARTHDATA_CLIENT_SECRET,
    NOAA_CDO_TOKEN: process.env.NOAA_CDO_TOKEN,
    GEOCODING_API_KEY: process.env.GEOCODING_API_KEY,
    AI_API_KEY: process.env.AI_API_KEY,
    AI_MODEL: process.env.AI_MODEL,
  });

  if (!result.success) {
    console.warn('⚠️ Environment variable warning:', result.error.format());
    // Return defaults for non-blocking execution
    return envSchema.parse({
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    });
  }

  return result.data;
}

export const env = getEnv();


# Environment Variables Documentation

This document explains all environment variables used by **The Earth Science Autopilot** (`spacegeoai.com`), their purpose, whether they are required, and instructions on how to obtain credentials.

---

## Variable Reference Table

| Variable Name | Required? | Client / Server | Purpose | Default / Example |
| :--- | :---: | :---: | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Yes | Client & Server | Base URL of the deployment | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | No | Client & Server | Branding display name | `"The Earth Science Autopilot"` |
| `NEXT_PUBLIC_APP_TAGLINE` | No | Client & Server | Platform tagline | `"ASK THE EARTH — Search. Investigate. Discover."` |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Client & Server | Supabase PostgreSQL project URL | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Client & Server | Supabase public anonymous API key | JWT string |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server Only | Supabase administrative key for backend operations | JWT string |
| `NASA_EARTHDATA_USERNAME` | Optional | Server Only | NASA Earthdata Login username for protected data | User identifier |
| `NASA_EARTHDATA_PASSWORD` | Optional | Server Only | NASA Earthdata Login password | User secret |
| `NASA_EARTHDATA_CLIENT_ID` | Optional | Server Only | OAuth client ID for AppEEARS / Earthdata | Client ID string |
| `NASA_EARTHDATA_CLIENT_SECRET` | Optional | Server Only | OAuth client secret | Secret string |
| `NOAA_CDO_TOKEN` | Optional | Server Only | NOAA Climate Data Online v2 Web Service token | 32-character token |
| `GEOCODING_API_KEY` | Optional | Server Only | Custom geocoding API key (Nominatim is keyless) | API key |
| `AI_API_KEY` | Optional | Server Only | Gemini / OpenAI key for natural language autopilot | API key |
| `AI_MODEL` | Optional | Server Only | Model identifier for research autopilot | `gemini-1.5-pro` |
| `NEXT_PUBLIC_MAP_STYLE_URL` | Optional | Client Only | MapLibre vector style JSON URL | `https://demotiles.maplibre.org/style.json` |

---

## Detailed Credential Acquisition Guides

### 1. Supabase (Database & Authentication)
1. Sign up at [https://supabase.com](https://supabase.com) and create a new project.
2. Go to **Project Settings** -> **API**.
3. Copy the **Project URL** into `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the **anon / public** key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Copy the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!).
6. Execute the SQL migration file located in `supabase/migrations/20261114_init_schema.sql` inside the Supabase SQL Editor.

### 2. NOAA Climate Data Online (CDO) Token
1. Visit [https://www.ncei.noaa.gov/cdo-web/token](https://www.ncei.noaa.gov/cdo-web/token).
2. Enter your email address to request a token.
3. NOAA will instantly email you a 32-character alphanumeric token.
4. Copy this token into `NOAA_CDO_TOKEN`.

### 3. NASA Earthdata Login
1. Public metadata discovery via NASA CMR (`cmr.earthdata.nasa.gov`) requires **no credentials**.
2. For restricted datasets and AppEEARS job submissions:
   - Register for an Earthdata account at [https://urs.earthdata.nasa.gov/users/new](https://urs.earthdata.nasa.gov/users/new).
   - Enter your username and password into `NASA_EARTHDATA_USERNAME` and `NASA_EARTHDATA_PASSWORD`.

### 4. AI Autopilot API Key
- If using Google Gemini:
  - Generate an API key at [https://aistudio.google.com/](https://aistudio.google.com/).
  - Set `AI_API_KEY="your-gemini-key"`.
- If no key is set, the Autopilot automatically switches to a deterministic heuristic research planner with 0 degradation of scientific or statistical capabilities.

---

## Configuring on Vercel
1. In your Vercel Dashboard, select your project.
2. Navigate to **Settings** -> **Environment Variables**.
3. Add the required variables under **Production**, **Preview**, and **Development**.
4. Redeploy your project.


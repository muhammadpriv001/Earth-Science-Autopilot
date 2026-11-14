# Deployment Guide — Vercel & Supabase

This guide provides step-by-step instructions for deploying **The Earth Science Autopilot** to Vercel with Supabase PostgreSQL and authentications.

---

## 1. Prerequisites

- A GitHub repository containing this codebase.
- A [Vercel](https://vercel.com) account.
- A [Supabase](https://supabase.com) account (optional, for persistent user projects and auth).

---

## 2. Supabase Database Setup

1. Create a new Supabase project.
2. In the left sidebar, navigate to the **SQL Editor**.
3. Create a new query and paste the contents of `supabase/migrations/20261114_init_schema.sql`.
4. Run the query. This sets up:
   - Tables: `profiles`, `research_projects`, `research_regions`, `research_plans`, `datasets`, `analysis_runs`, `time_series`, `reports`.
   - Complete Row Level Security (RLS) policies.
   - Indexes for performance.
5. Optionally run `supabase/seed.sql` to populate public dataset metadata.
6. Retrieve your **Project URL**, **Anon Key**, and **Service Role Key** under **Project Settings -> API**.

---

## 3. Vercel Deployment Steps

1. In your Vercel Dashboard, click **Add New...** -> **Project**.
2. Select your `Earth-Science-Autopilot` repository.
3. Keep the default build settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
   - **Install Command:** `pnpm install`
4. Expand **Environment Variables** and add the following:

```env
# Required for full URL generation
NEXT_PUBLIC_APP_URL="https://spacegeoai.com"
NEXT_PUBLIC_APP_NAME="The Earth Science Autopilot"
NEXT_PUBLIC_APP_TAGLINE="ASK THE EARTH — Search. Investigate. Discover."

# Supabase (optional, for auth and saving projects)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NOAA CDO (optional, for live in-situ weather stations)
NOAA_CDO_TOKEN="your-noaa-token"

# AI Autopilot (optional)
AI_API_KEY="your-gemini-key"
AI_MODEL="gemini-1.5-pro"
```

5. Click **Deploy**.
6. Once deployed, assign your custom domain `spacegeoai.com` in Vercel **Settings -> Domains**.

---

## 4. Post-Deployment Verification

1. Check system health:  
   Navigate to `https://spacegeoai.com/api/health` — should return HTTP 200 with `status: "healthy"`.
2. Test NASA CMR discovery:  
   Navigate to `https://spacegeoai.com/datasets` — should display live NASA collections.
3. Test Time-Series analysis:  
   Navigate to `https://spacegeoai.com/analysis?preset=lahore` — should render the interactive SVG chart and statistical decomposition.


# THE EARTH SCIENCE AUTOPILOT — MASTER EXECUTION & TAKEOVER PLAN

> **Tagline:** ASK THE EARTH — Search. Investigate. Discover.  
> **Challenge:** NASA Space Apps Challenge 2026: Be An Earth System Trend Detective!  
> **Domain:** `spacegeoai.com`  
> **Target Framework:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, MapLibre GL, Plotly.js / Charting, Supabase PostgreSQL / Auth, Vercel ready.

---

## 1. Executive Summary & Core Mandate

The Earth Science Autopilot is an AI-assisted Earth-science research and discovery platform. It is NOT just a landing page, static mockup, or UI skin. It is an end-to-end scientific investigation engine capable of:
1. Translating natural language questions into structured, verifiable scientific research plans.
2. Interfacing with real NASA / NOAA / open Earth science APIs (NASA CMR, AppEEARS, NOAA CDO, Giovanni, Open-Meteo, etc.) and fallback verified scientific datasets.
3. Performing deterministic, scientifically rigorous statistical calculations (Linear Regression, Mann-Kendall trend test with tie correction, Sen's slope, p-value calculation, confidence intervals).
4. Visualizing spatial changes (MapLibre GL JS, GeoJSON boundaries, bounding box / polygon buffers) and temporal changes (Plotly.js time-series charts with trend overlays).
5. Comparing distinct geographic regions to identify spatial divergence in environmental indicators.
6. Generating comprehensive, reproducible scientific reports (PDF / CSV export, provenance metadata).
7. Persisting research projects, plans, and results in Supabase with Row Level Security (RLS).

---

## 2. System Architecture & Tech Stack

```
[ Frontend: Next.js App Router (TypeScript + Tailwind CSS + Lucide) ]
  ├── Interactive Map: MapLibre GL JS + Turf.js
  ├── Visualizations: Plotly.js (dynamic time-series, trendlines, CI bands)
  ├── UI Components: Radix UI / shadcn style clean scientific dark/light theme
  └── State / Form Management: React Hooks + Zod schemas

[ API Routes / Server Handlers (/api/...) ]
  ├── /api/locations/search (Geocoding / Nominatim / Photon)
  ├── /api/nasa/collections (NASA CMR API client)
  ├── /api/nasa/granules (NASA CMR Granule discovery)
  ├── /api/noaa/datasets, /api/noaa/stations, /api/noaa/data (NOAA CDO v2)
  ├── /api/research/plan (Structured AI/heuristic plan builder)
  ├── /api/analysis/timeseries (Data acquisition & parsing)
  ├── /api/analysis/trend (Mann-Kendall, Sen's slope, OLS regression)
  ├── /api/analysis/compare (Multi-region comparative analysis)
  └── /api/projects & /api/reports (CRUD & PDF/Markdown/CSV export)

[ Scientific Core: src/lib/science/ ]
  ├── mann-kendall.ts (S-statistic, variance with tie adjustment, Z-score, p-value)
  ├── sens-slope.ts (Median of pairwise slopes)
  ├── linear-regression.ts (OLS slope, intercept, R², standard error, CI)
  ├── descriptive-stats.ts (mean, min, max, std-dev, missing data count)
  └── data-cleaner.ts (gap detection, outlier handling, quality flag filtering)

[ Database & Auth: Supabase (PostgreSQL) ]
  ├── profiles, research_projects, research_regions, research_plans
  ├── datasets, analysis_runs, time_series, reports
  └── Strict RLS Policies & TypeScript types
```

---

## 3. High-Priority Directory & File Structure

```text
Earth-Science-Autopilot/
├── plan.md                                    # This takeover & execution document
├── README.md                                  # Setup, deployment & architecture docs
├── ENVIRONMENT.md                             # Comprehensive env variable guide
├── ARCHITECTURE.md                            # System design & data flow
├── DATA_SOURCES.md                            # NASA, NOAA, CSA provider specifications
├── SCIENTIFIC_METHODS.md                      # Mathematical formulas & algorithms
├── DEPLOYMENT.md                              # Vercel & Supabase deployment checklist
├── .env.example                               # Template of all environment variables
├── .env.local                                 # Local development environment configuration
├── .gitignore                                 # Git ignore rules
├── package.json                               # Dependencies & scripts
├── tsconfig.json                              # TypeScript strict configuration
├── tailwind.config.ts                         # Tailwind CSS configuration
├── supabase/
│   ├── migrations/
│   │   └── 20261114_init_schema.sql           # Complete PostgreSQL schema & RLS policies
│   └── seed.sql                               # Seed data for variables, sample datasets
└── src/
    ├── app/
    │   ├── layout.tsx                         # Root layout with navbar, footer, theme provider
    │   ├── page.tsx                           # Landing page with mission statement & quick-start
    │   ├── dashboard/page.tsx                 # Central research hub with recent projects & stats
    │   ├── explore/page.tsx                   # Full-screen MapLibre GIS explorer with draw tools
    │   ├── variables/page.tsx                 # Earth-science variable catalog (6 categories)
    │   ├── datasets/page.tsx                  # NASA CMR & NOAA dataset search & metadata viewer
    │   ├── autopilot/page.tsx                 # AI Research Question -> Interactive Plan generator
    │   ├── analysis/page.tsx                  # Time-series lab (Plotly charts, trend tests, CSV export)
    │   ├── compare/page.tsx                   # Multi-region comparison lab (side-by-side trends)
    │   ├── resources/page.tsx                 # Comprehensive directory of NASA/CSA/scientific tools
    │   ├── projects/
    │   │   ├── page.tsx                       # User's saved research projects
    │   │   └── [id]/page.tsx                  # Individual project workspace
    │   ├── reports/
    │   │   └── [id]/page.tsx                  # Exportable research report with charts & citations
    │   ├── settings/page.tsx                  # User profile & API keys settings
    │   ├── auth/
    │   │   ├── sign-in/page.tsx               # Supabase Auth sign-in
    │   │   └── sign-up/page.tsx               # Supabase Auth sign-up
    │   └── api/
    │       ├── health/route.ts                # System status check
    │       ├── locations/search/route.ts      # Geocoding search
    │       ├── nasa/
    │       │   ├── collections/route.ts       # NASA CMR Collections API
    │       │   └── granules/route.ts          # NASA CMR Granules API
    │       ├── noaa/
    │       │   ├── stations/route.ts          # NOAA CDO Stations
    │       │   └── data/route.ts              # NOAA CDO Observations
    │       ├── research/
    │       │   └── plan/route.ts              # Natural language research planner
    │       ├── analysis/
    │       │   ├── timeseries/route.ts        # Data fetching / generation pipeline
    │       │   ├── trend/route.ts             # Statistical trend engine
    │       │   └── compare/route.ts           # Dual-region comparison engine
    │       ├── projects/route.ts              # Project CRUD
    │       └── reports/route.ts               # Report generation & storage
    ├── components/
    │   ├── ui/                                # Button, Input, Card, Modal, Select, Tabs, etc.
    │   ├── layout/                            # Navbar, Sidebar, Footer, Breadcrumbs
    │   ├── maps/
    │   │   ├── MapLibreMap.tsx                # Interactive MapLibre component
    │   │   └── DrawControl.tsx                # Polygon / Bounding Box / Point drawing tools
    │   ├── charts/
    │   │   ├── TimeSeriesChart.tsx            # Plotly.js time-series with regression & CI
    │   │   └── ComparisonChart.tsx            # Dual series comparison plot
    │   ├── research/
    │   │   ├── ResearchPlanCard.tsx           # Editable research plan component
    │   │   ├── StatisticalSummary.tsx         # Mann-Kendall & Sen's slope display
    │   │   └── ProvenanceBadge.tsx            # Live / Cached / Demo data indicator
    │   └── datasets/
    │       ├── DatasetCard.tsx                # Dataset information card
    │       └── SuitabilityBadge.tsx           # Scientific suitability indicator
    ├── lib/
    │   ├── env.ts                             # Typed Zod environment variable validator
    │   ├── supabase/
    │   │   ├── client.ts                      # Client-side Supabase client
    │   │   └── server.ts                      # Server-side Supabase client
    │   ├── science/
    │   │   ├── statistics.ts                  # Linear regression, mean, std, CI
    │   │   ├── mann-kendall.ts                # Mann-Kendall S-test with tie correction & p-value
    │   │   ├── sens-slope.ts                  # Sen's robust nonparametric slope
    │   │   └── earth-variables.ts             # 15+ curated Earth science variable definitions
    │   ├── providers/
    │   │   ├── nasa-cmr.ts                    # Live NASA CMR REST API integration
    │   │   ├── noaa-cdo.ts                    # Live NOAA CDO v2 API integration
    │   │   ├── open-meteo.ts                  # Global historical climate API (ERA5 reanalysis)
    │   │   └── mock-datasets.ts               # Verified benchmark demonstration data
    │   ├── geospatial/
    │   │   └── geo-utils.ts                   # Bounding box, distance, GeoJSON helpers
    │   └── utils/                             # General helpers, formatting, date routines
    └── types/
        ├── index.ts                           # Shared data types (Variables, Datasets, Analysis)
        └── database.ts                        # Supabase generated database types
```

---

## 4. Scientific Algorithms & Implementation Specifications

### A. Mann-Kendall Trend Test
- Calculates relative rankings $S = \sum_{k=1}^{n-1} \sum_{j=k+1}^n \text{sgn}(x_j - x_k)$.
- Handles tied values through variance adjustment:
  $$\text{Var}(S) = \frac{n(n-1)(2n+5) - \sum_{i=1}^g t_i(t_i-1)(2t_i+5)}{18}$$
- Computes standard normal test statistic $Z$:
  - $Z = (S - 1) / \sqrt{\text{Var}(S)}$ if $S > 0$
  - $Z = 0$ if $S = 0$
  - $Z = (S + 1) / \sqrt{\text{Var}(S)}$ if $S < 0$
- Derives 2-tailed p-value using standard normal CDF approximation.
- Evaluates against $\alpha = 0.05$ threshold.

### B. Sen's Slope Estimator
- Non-parametric slope calculated as the median of all pairwise slopes:
  $$Q_{jk} = \frac{x_j - x_k}{j - k} \quad \text{for } 1 \le k < j \le n$$
- Robust against seasonal outliers and measurement noise.

### C. Ordinary Least Squares (OLS) Linear Regression
- Computes slope $\beta_1$, intercept $\beta_0$, coefficient of determination $R^2$, standard error $SE$, and 95% confidence interval band across all time steps.

---

## 5. Live Data Provider Integration Specifications

1. **NASA Common Metadata Repository (CMR)**
   - Base URL: `https://cmr.earthdata.nasa.gov/search/collections.json`
   - Real-time querying by keyword, platform (MODIS, Landsat, GPM, SMAP, etc.), temporal range, and bounding box coordinates.
   - Granule discovery via `/search/granules.json`.

2. **NOAA Climate Data Online (CDO) v2**
   - Base URL: `https://www.ncei.noaa.gov/cdo-web/api/v2`
   - Queries historical weather stations, daily summaries (GHCND), and precipitation/temperature extremes using `NOAA_CDO_TOKEN`.

3. **Global Reanalysis & Earth-Observation Interface (Open-Meteo Historical / ERA5)**
   - High-reliability, keyless open access to ECMWF ERA5 reanalysis data for any latitude/longitude coordinate globally from 1940 to present.
   - Provides actual historical daily & monthly temperatures, precipitation, soil moisture, and solar radiation with exact coordinates.

4. **Curated Demonstration Datasets**
   - When external APIs are unavailable or rate-limited, the system falls back seamlessly to labeled benchmark datasets (e.g. Lahore 30-year temperature anomalies, Amazon Basin deforestation/precipitation indices, Arctic sea ice extent), clearly tagged with `is_demonstration: true`.

---

## 6. Takeover Implementation Roadmap (Step-by-Step)

| Step | Task | Status | Focus / Notes |
|:---:|:---|:---:|:---|
| **1** | Copy scaffold files from `earth-autopilot-tmp` to root | ✅ Complete | Root contains Next.js 16.4.6 App Router, TS configs, public assets |
| **2** | Install dependencies (MapLibre, Plotly, Lucide, Supabase, Zod) | ✅ Complete | Next.js, React 19, Lucide, Tailwind, Supabase, Zod installed and verified |
| **3** | Environment Setup (`.env.example`, `.env.local`, `src/lib/env.ts`) | ✅ Complete | Typed environment configuration with real Supabase, NOAA, Groq API keys |
| **4** | Supabase Migration (`supabase/migrations/20261114_init_schema.sql`) | ✅ Complete | 8 PostgreSQL tables, RLS policies, indexes, and seed.sql |
| **5** | Scientific Engine (`src/lib/science/...`) | ✅ Complete | Mann-Kendall with tie adjustments, Sen's slope, OLS, 5/5 unit tests pass |
| **6** | Data Providers (`src/lib/providers/...`) | ✅ Complete | NASA CMR collections, NOAA CDO v2, Open-Meteo ERA5, 3 benchmark datasets |
| **7** | API Route Handlers (`src/app/api/...`) | ✅ Complete | 10 API route handlers including Groq AI research planner & trend calculation |
| **8** | UI & Visualization Components (`src/components/...`) | ✅ Complete | Interactive SVG time-series charts, dual-region comparisons, MapLibre GIS map |
| **9** | Complete Application Pages (15 required pages) | ✅ Complete | All 15 required route pages implemented and prerendered |
| **10** | Comprehensive Documentation & Tests | ✅ Complete | README, ARCHITECTURE, SCIENTIFIC_METHODS, DATA_SOURCES, AUDIT_CHECKLIST |
| **11** | Production Build & Verification | ✅ Complete | `npm run build` succeeds (26/26 pages/routes generated with 0 errors) |

---

## 7. Guidelines for Any Developer or Agent Taking Over
- Keep all scientific calculations strictly deterministic in TypeScript (do not use LLM for math).
- Always include clear visual provenance badges: Live Data vs. Demonstration Benchmark.
- Ensure all pages are responsive and have dark/light scientific themes.
- Test building with `npm run build` to verify zero TypeScript or Next.js build errors.


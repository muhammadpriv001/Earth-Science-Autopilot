# The Earth Science Autopilot — Architecture & System Design

> **Tagline:** ASK THE EARTH — Search. Investigate. Discover.  
> **Challenge:** NASA Space Apps Challenge 2026: Be An Earth System Trend Detective!  
> **Domain:** `spacegeoai.com`

---

## 1. High-Level Architecture Overview

```
                      +------------------------------------------+
                      |         User / Browser Interface        |
                      |   (Next.js App Router, Tailwind CSS,     |
                      |    Interactive SVG Charts, MapLibre)     |
                      +--------------------+---------------------+
                                           |
                                  HTTPS / JSON Fetch
                                           |
                      +--------------------v---------------------+
                      |         Next.js Route Handlers           |
                      |                 (/api/*)                 |
                      +--------------------+---------------------+
                                           |
        +------------------+---------------+------------------+------------------+
        |                  |                                  |                  |
+-------v-------+  +-------v-------+                  +-------v-------+  +-------v-------+
|  NASA CMR API |  | Open-Meteo    |                  |  NOAA CDO v2  |  |   Supabase    |
|  (Collections |  | ERA5 Climate  |                  |  (GHCND Land  |  |  PostgreSQL   |
|   & Granules) |  |  Reanalysis)  |                  |   Stations)   |  |  (RLS & Auth) |
+---------------+  +---------------+                  +---------------+  +---------------+
                           |
        +------------------v----------------------------------+
        |         Scientific Trend Processing Engine          |
        |             (Pure TypeScript Lib Core)              |
        |  - Mann-Kendall Non-Parametric Trend Test (S, Z, p) |
        |  - Sen's Slope Estimator (Median pairwise, 95% CI)  |
        |  - OLS Linear Regression (Slope, R², Std Error)     |
        |  - Descriptive Stats & Quality-Flag Filtering       |
        +-----------------------------------------------------+
```

---

## 2. Layered Responsibilities

### A. Presentation Layer (`src/app/`, `src/components/`)
- Responsive layouts built with Tailwind CSS.
- Interactive time-series charts with hover tooltips, trendlines, and CSV exports.
- MapLibre GIS explorer with bounding box, circular radius buffers, and geocoding.
- Statistical summary cards displaying Z-scores, p-values, and Sen's slope values.

### B. Orchestration & API Layer (`src/app/api/`)
- `/api/health`: Application readiness and provider status report.
- `/api/locations/search`: Geocoding queries via OpenStreetMap Nominatim.
- `/api/nasa/collections`: Live queries to NASA CMR Search API.
- `/api/noaa/stations` & `/api/noaa/data`: NOAA NCEI Climate Data Online v2 queries.
- `/api/research/plan`: Converts natural-language questions into structured plans.
- `/api/analysis/timeseries`: Live or benchmark time-series data acquisition.
- `/api/analysis/trend`: Statistical calculations and grounded scientific interpretations.
- `/api/analysis/compare`: Comparative dual-region analysis.
- `/api/resources`: Comprehensive NASA/CSA/climate resources catalog.

### C. Scientific Computing Core (`src/lib/science/`)
- Pure TypeScript, zero external numeric library dependencies to ensure fast, deterministic execution in Vercel serverless environments.
- Formulations:
  - Mann-Kendall S-statistic with tie adjustment variance.
  - Standard Normal CDF approximation using Hart's algorithm for exact p-values.
  - Theil-Sen median slope estimator with 95% confidence bounds.
  - Ordinary Least Squares regression with $R^2$ and standard error.

### D. Data Persistence & Authentication (`src/lib/supabase/`, `supabase/migrations/`)
- PostgreSQL database schemas with Row Level Security (RLS).
- Project isolation: users can only manage their own projects and reports.
- Seamless fallback mode for zero-configuration local development.


# The Earth Science Autopilot

<div align="center">

**ASK THE EARTH — Search. Investigate. Discover.**

*NASA Space Apps Challenge 2026: Be An Earth System Trend Detective!*

[![Domain](https://img.shields.io/badge/Domain-spacegeoai.com-06b6d4)](https://spacegeoai.com)
[![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## 1. Overview & Vision

**The Earth Science Autopilot** is an AI-assisted Earth-science research and discovery platform built for the **NASA Space Apps Challenge 2026: Be An Earth System Trend Detective!**

Users can formulate environmental research hypotheses in natural English (e.g. *"Has surface temperature increased in Lahore over the last 30 years?"* or *"Compare precipitation trends between the Amazon Basin and Sahara"*). The platform automatically:
1. Translates natural language inquiries into structured, verifiable scientific research plans.
2. Discovers real Earth-observation datasets via NASA's Common Metadata Repository (CMR) and NOAA Climate Data Online.
3. Retrieves in-situ or satellite reanalysis time-series data (ECMWF ERA5, GHCND, MODIS, GPM, SWOT).
4. Computes deterministic statistical trend metrics:
   - **Ordinary Least Squares (OLS) Linear Regression** ($R^2$, slope, intercept, standard error).
   - **Mann-Kendall Non-Parametric Trend Test** with exact tie variance adjustments and two-tailed p-values.
   - **Sen's Non-Parametric Slope Estimator** (median pairwise slope with 95% confidence intervals).
5. Visualizes spatial and temporal changes with interactive SVG charts, GIS coordinate pinning, and dual-region comparison plots.
6. Generates printable, reproducible scientific investigation reports with full data provenance citations.

> **Scientific Integrity Guarantee:** All statistical analyses are computed by deterministic, audited TypeScript algorithms. No synthetic or hallucinated numbers are generated.

---

## 2. Main Application Modules

| Module | Route | Purpose |
| :--- | :--- | :--- |
| **Landing Page** | `/` | Platform introduction, NASA challenge banner, guided investigations |
| **Research Dashboard** | `/dashboard` | Central research hub, live data provider health, recent analyses |
| **Global GIS Explorer** | `/explore` | Map coordinate search, point & bounding box selection |
| **Variable Library** | `/variables` | 15+ curated Earth variables with units, principles, and limitations |
| **Dataset Discovery** | `/datasets` | Live NASA CMR & NOAA dataset search, platform/sensor filtering |
| **Research Autopilot** | `/autopilot` | AI / Heuristic natural-language question planner |
| **Time-Series Lab** | `/analysis` | Interactive time-series plotting, Mann-Kendall statistics, CSV export |
| **Regional Comparison** | `/compare` | Dual-region trend divergence analysis (e.g. warming vs. cooling) |
| **Resources Directory**| `/resources` | Comprehensive catalog of NASA, CSA, NOAA, and statistical tools |
| **Project Workspace** | `/projects` | Saved research projects and reproducible runs |
| **Individual Project** | `/projects/[id]`| Project details, research question, and findings |
| **Scientific Reports** | `/reports/[id]` | Formal PDF/printable research reports with citations |
| **Platform Settings** | `/settings` | API token configuration (NOAA CDO, Earthdata, Gemini) |
| **Sign In** | `/auth/sign-in` | Supabase authentication sign-in (guest local mode supported) |
| **Sign Up** | `/auth/sign-up` | New researcher registration |

---

## 3. Technology Stack

- **Framework:** Next.js (App Router), React 19, TypeScript.
- **Styling & UI:** Tailwind CSS, Lucide Icons, scientific space theme.
- **Geospatial & Mapping:** MapLibre GL JS, Turf.js, OpenStreetMap Nominatim geocoding.
- **Visualizations:** High-performance SVG dynamic charting with trendlines, confidence bands, and tooltips.
- **Database & Auth:** Supabase PostgreSQL, Row Level Security (RLS), Supabase Auth.
- **Deployment:** Vercel serverless functions and edge runtime.

---

## 4. Getting Started Locally

### Prerequisites
- Node.js >= 20.x (Node 24 recommended)
- pnpm >= 9.x or npm >= 10.x

### Installation
```bash
# Clone repository
git clone https://github.com/spacegeoai/earth-science-autopilot.git
cd earth-science-autopilot

# Install dependencies
pnpm install
```

### Environment Configuration
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. See [ENVIRONMENT.md](ENVIRONMENT.md) for full descriptions of all environment variables.
3. *Note:* The application runs out-of-the-box in local development mode without requiring any paid API keys.

### Running Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Scientific Tests
```bash
pnpm test
```
Validates mathematical calculations (Mann-Kendall test, tie adjustments, Z-score, Sen's slope against extreme outliers, OLS regression) using Node's native test runner.

---

## 5. Supabase Setup & Database Migrations

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run the migration script located at:
   ```text
   supabase/migrations/20261114_init_schema.sql
   ```
4. Optionally run `supabase/seed.sql` to populate public dataset metadata.
5. Copy your project URL and Anon key into `.env.local`.

---

## 6. Vercel Deployment

1. Push your repository to GitHub.
2. Import the repository into your Vercel Dashboard.
3. Configure the environment variables in Vercel **Settings -> Environment Variables** as detailed in [DEPLOYMENT.md](DEPLOYMENT.md).
4. Deploy!

---

## 7. License

MIT License. Open-source software developed for NASA Space Apps Challenge 2026.

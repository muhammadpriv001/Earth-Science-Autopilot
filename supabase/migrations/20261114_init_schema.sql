-- ==============================================================================
-- THE EARTH SCIENCE AUTOPILOT — SUPABASE POSTGRESQL INITIAL SCHEMA & RLS
-- ==============================================================================
-- Challenge: NASA Space Apps Challenge 2026: Be An Earth System Trend Detective!
-- Domain: spacegeoai.com
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    institution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 2. RESEARCH PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.research_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    research_question TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'executing', 'completed', 'archived')),
    is_public BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public projects are viewable by everyone" 
    ON public.research_projects FOR SELECT 
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
    ON public.research_projects FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
    ON public.research_projects FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
    ON public.research_projects FOR DELETE 
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_research_projects_user_id ON public.research_projects(user_id);

-- 3. RESEARCH REGIONS TABLE
CREATE TABLE IF NOT EXISTS public.research_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    geometry JSONB NOT NULL,
    geometry_type TEXT NOT NULL CHECK (geometry_type IN ('point', 'bbox', 'polygon', 'buffer')),
    center_latitude DOUBLE PRECISION,
    center_longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.research_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view regions for accessible projects" 
    ON public.research_regions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.research_projects p 
            WHERE p.id = research_regions.project_id 
            AND (p.is_public = true OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert regions in their own projects" 
    ON public.research_regions FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.research_projects p 
            WHERE p.id = research_regions.project_id 
            AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete regions in their own projects" 
    ON public.research_regions FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.research_projects p 
            WHERE p.id = research_regions.project_id 
            AND p.user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_research_regions_project_id ON public.research_regions(project_id);

-- 4. RESEARCH PLANS TABLE
CREATE TABLE IF NOT EXISTS public.research_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE NOT NULL,
    plan_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.research_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view plans for accessible projects" 
    ON public.research_plans FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.research_projects p 
            WHERE p.id = research_plans.project_id 
            AND (p.is_public = true OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage plans for their projects" 
    ON public.research_plans FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.research_projects p 
            WHERE p.id = research_plans.project_id 
            AND p.user_id = auth.uid()
        )
    );

-- 5. DATASETS REGISTRY (Public Metadata Catalog)
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL, -- 'NASA_CMR', 'NOAA_CDO', 'OPEN_METEO', 'CSA_RCM', etc.
    external_dataset_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(provider, external_dataset_id)
);

ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Datasets are readable by anyone" 
    ON public.datasets FOR SELECT 
    USING (true);

-- 6. ANALYSIS RUNS TABLE
CREATE TABLE IF NOT EXISTS public.analysis_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES public.datasets(id),
    variable TEXT NOT NULL,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    parameters_json JSONB DEFAULT '{}'::jsonb,
    results_json JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analysis runs for their projects" 
    ON public.analysis_runs FOR SELECT 
    USING (
        project_id IS NULL OR EXISTS (
            SELECT 1 FROM public.research_projects p 
            WHERE p.id = analysis_runs.project_id 
            AND (p.is_public = true OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert analysis runs" 
    ON public.analysis_runs FOR INSERT 
    WITH CHECK (
        project_id IS NULL OR EXISTS (
            SELECT 1 FROM public.research_projects p 
            WHERE p.id = analysis_runs.project_id 
            AND p.user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_analysis_runs_project_id ON public.analysis_runs(project_id);

-- 7. TIME SERIES TABLE
CREATE TABLE IF NOT EXISTS public.time_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_run_id UUID REFERENCES public.analysis_runs(id) ON DELETE CASCADE NOT NULL,
    observation_date DATE NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    quality_flag TEXT DEFAULT 'VALID',
    metadata_json JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.time_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view time series for accessible runs" 
    ON public.time_series FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.analysis_runs ar
            LEFT JOIN public.research_projects p ON ar.project_id = p.id
            WHERE ar.id = time_series.analysis_run_id
            AND (p.is_public = true OR p.user_id = auth.uid() OR ar.project_id IS NULL)
        )
    );

CREATE POLICY "Users can insert time series" 
    ON public.time_series FOR INSERT 
    WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_time_series_run_date ON public.time_series(analysis_run_id, observation_date);

-- 8. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    analysis_run_id UUID REFERENCES public.analysis_runs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT,
    report_content_json JSONB NOT NULL,
    report_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reports for accessible projects" 
    ON public.reports FOR SELECT 
    USING (
        project_id IS NULL OR EXISTS (
            SELECT 1 FROM public.research_projects p 
            WHERE p.id = reports.project_id 
            AND (p.is_public = true OR p.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can create reports" 
    ON public.reports FOR INSERT 
    WITH CHECK (true);


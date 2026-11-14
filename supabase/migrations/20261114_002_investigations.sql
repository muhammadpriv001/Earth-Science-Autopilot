-- ==============================================================================
-- THE EARTH SCIENCE AUTOPILOT — MIGRATION: INVESTIGATIONS & PROFILE EXPANSION
-- ==============================================================================
-- Adds saved_investigations table for user project persistence
-- Expands profiles with email, role, and bio columns
-- ==============================================================================

-- 1. EXPAND PROFILES TABLE
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Earth-System Researcher',
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. SAVED INVESTIGATIONS TABLE
CREATE TABLE IF NOT EXISTS public.saved_investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Location snapshot: primary
  main_location_name TEXT NOT NULL,
  main_location_lng DOUBLE PRECISION NOT NULL,
  main_location_lat DOUBLE PRECISION NOT NULL,
  main_location_radius_km DOUBLE PRECISION DEFAULT 100,
  main_location_bbox DOUBLE PRECISION[],

  -- Location snapshot: secondary (comparison)
  secondary_location_name TEXT,
  secondary_location_lng DOUBLE PRECISION,
  secondary_location_lat DOUBLE PRECISION,
  secondary_location_radius_km DOUBLE PRECISION,

  -- Analysis parameters
  selected_category TEXT,
  selected_variable TEXT,
  forecast_horizon_months INT,
  confidence_level INT,

  -- Chat history snapshot (JSONB array of {role, content, timestamp})
  chat_messages JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.saved_investigations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own investigations"
  ON public.saved_investigations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investigations"
  ON public.saved_investigations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investigations"
  ON public.saved_investigations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investigations"
  ON public.saved_investigations FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_investigations_user_id
  ON public.saved_investigations(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_investigations_updated_at
  ON public.saved_investigations(updated_at DESC);

-- 3. TRIGGER: auto-create profile row on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. TRIGGER: auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_investigations ON public.saved_investigations;
CREATE TRIGGER set_updated_at_investigations
  BEFORE UPDATE ON public.saved_investigations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

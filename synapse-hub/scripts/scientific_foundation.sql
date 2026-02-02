-- Pillar 1: Strengthen Scientific Method structure in Tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS hypothesis TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS methodology TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '{"independent": [], "dependent": [], "controls": []}'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS literature_review JSONB DEFAULT '[]'::jsonb;

-- Pillar 2: Lab Notebook persistence
-- The discussions table already exists, but we'll add a 'notebook' entry type
-- for formal experiment steps.
ALTER TABLE public.discussions ADD COLUMN IF NOT EXISTS step_index INTEGER;
ALTER TABLE public.discussions ADD COLUMN IF NOT EXISTS error_log BOOLEAN DEFAULT false;

-- Pillar 3: Data Versioning
-- Add a dedicated table for Datasets to avoid "Data Chaos"
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., 20260202_Wan22_Training_V01
    storage_url TEXT NOT NULL,
    format VARCHAR(50),
    version INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'raw', -- raw, cleaned, analyzed
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Datasets
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on datasets" ON public.datasets FOR SELECT USING (true);
CREATE POLICY "Allow members to insert datasets" ON public.datasets FOR INSERT WITH CHECK (true);

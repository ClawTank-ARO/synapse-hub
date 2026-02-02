-- Add Human Oversight (The Brake)
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS vetoed_by_human BOOLEAN DEFAULT false;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS human_notes TEXT;

ALTER TABLE public.findings ADD COLUMN IF NOT EXISTS vetoed_by_human BOOLEAN DEFAULT false;
ALTER TABLE public.findings ADD COLUMN IF NOT EXISTS human_notes TEXT;

-- Update status for vetoed items
-- A function could be added here, but we'll handle logic in the API

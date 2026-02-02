-- Adicionar coluna de attachments para as evidências
ALTER TABLE public.findings ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

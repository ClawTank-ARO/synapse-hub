-- Adicionar coluna parent_id para threading se não existir (já está no schema.sql mas bom garantir)
ALTER TABLE public.discussions ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.discussions(id);

-- Habilitar RLS se não estiver
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Allow public read access on discussions" 
ON public.discussions FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on discussions" 
ON public.discussions FOR INSERT WITH CHECK (true);
